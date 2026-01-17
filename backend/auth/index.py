import json
import os
import hashlib
import secrets
import psycopg2
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    '''API для регистрации и авторизации пользователей'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    action = event.get('queryStringParameters', {}).get('action', '')
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cursor = conn.cursor()
        
        if action == 'register' and method == 'POST':
            data = json.loads(event.get('body', '{}'))
            username = data.get('username', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '')
            
            if not username or not email or not password:
                return response(400, {'error': 'Все поля обязательны'})
            
            if len(username) < 3:
                return response(400, {'error': 'Имя пользователя должно быть минимум 3 символа'})
            
            if len(password) < 6:
                return response(400, {'error': 'Пароль должен быть минимум 6 символов'})
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            try:
                cursor.execute(
                    "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING id, username, email, created_at",
                    (username, email, password_hash)
                )
                user = cursor.fetchone()
                conn.commit()
                
                token = secrets.token_urlsafe(32)
                
                return response(200, {
                    'success': True,
                    'message': 'Регистрация успешна',
                    'user': {
                        'id': user[0],
                        'username': user[1],
                        'email': user[2],
                        'created_at': user[3].isoformat()
                    },
                    'token': token
                })
            except psycopg2.IntegrityError:
                conn.rollback()
                return response(400, {'error': 'Пользователь с таким именем или email уже существует'})
        
        elif action == 'login' and method == 'POST':
            data = json.loads(event.get('body', '{}'))
            username = data.get('username', '').strip()
            password = data.get('password', '')
            
            if not username or not password:
                return response(400, {'error': 'Введите имя пользователя и пароль'})
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            cursor.execute(
                "SELECT id, username, email, created_at FROM users WHERE username = %s AND password_hash = %s",
                (username, password_hash)
            )
            user = cursor.fetchone()
            
            if not user:
                return response(401, {'error': 'Неверное имя пользователя или пароль'})
            
            token = secrets.token_urlsafe(32)
            
            return response(200, {
                'success': True,
                'message': 'Вход выполнен',
                'user': {
                    'id': user[0],
                    'username': user[1],
                    'email': user[2],
                    'created_at': user[3].isoformat()
                },
                'token': token
            })
        
        elif action == 'verify' and method == 'GET':
            auth_header = event.get('headers', {}).get('Authorization', '')
            if not auth_header:
                return response(401, {'error': 'Токен не предоставлен'})
            
            return response(200, {
                'success': True,
                'message': 'Токен валиден'
            })
        
        else:
            return response(400, {'error': 'Неверное действие'})
    
    except Exception as e:
        return response(500, {'error': f'Ошибка сервера: {str(e)}'})
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

def response(status_code: int, data: dict) -> dict:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(data, ensure_ascii=False),
        'isBase64Encoded': False
    }
