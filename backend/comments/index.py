import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для работы с комментариями к товарам'''
    
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
        
        if action == 'get' and method == 'GET':
            product_id = event.get('queryStringParameters', {}).get('product_id', '')
            
            if not product_id:
                return response(400, {'error': 'Не указан product_id'})
            
            cursor.execute("""
                SELECT c.id, c.comment_text, c.rating, c.created_at, u.username
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.product_id = %s
                ORDER BY c.created_at DESC
            """, (product_id,))
            
            comments = []
            for row in cursor.fetchall():
                comments.append({
                    'id': row[0],
                    'text': row[1],
                    'rating': row[2],
                    'created_at': row[3].isoformat(),
                    'username': row[4]
                })
            
            return response(200, {
                'success': True,
                'comments': comments
            })
        
        elif action == 'add' and method == 'POST':
            data = json.loads(event.get('body', '{}'))
            product_id = data.get('product_id', '')
            user_id = data.get('user_id')
            comment_text = data.get('comment_text', '').strip()
            rating = data.get('rating')
            
            if not product_id or not user_id or not comment_text:
                return response(400, {'error': 'Все поля обязательны'})
            
            if rating and (rating < 1 or rating > 5):
                return response(400, {'error': 'Рейтинг должен быть от 1 до 5'})
            
            cursor.execute(
                "SELECT id FROM users WHERE id = %s",
                (user_id,)
            )
            if not cursor.fetchone():
                return response(404, {'error': 'Пользователь не найден'})
            
            cursor.execute("""
                INSERT INTO comments (product_id, user_id, comment_text, rating)
                VALUES (%s, %s, %s, %s)
                RETURNING id, created_at
            """, (product_id, user_id, comment_text, rating))
            
            result = cursor.fetchone()
            conn.commit()
            
            cursor.execute(
                "SELECT username FROM users WHERE id = %s",
                (user_id,)
            )
            username = cursor.fetchone()[0]
            
            return response(200, {
                'success': True,
                'message': 'Комментарий добавлен',
                'comment': {
                    'id': result[0],
                    'text': comment_text,
                    'rating': rating,
                    'created_at': result[1].isoformat(),
                    'username': username
                }
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
