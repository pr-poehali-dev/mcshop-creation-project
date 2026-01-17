import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

type Comment = {
  id: number;
  text: string;
  rating: number | null;
  created_at: string;
  username: string;
};

type ProductCommentsProps = {
  productId: string;
  user: any | null;
  onLoginClick: () => void;
};

const COMMENTS_URL = 'https://functions.poehali.dev/84b1b70f-3f6b-4a53-9bf1-90ab4105614a';

export function ProductComments({ productId, user, onLoginClick }: ProductCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [productId]);

  const loadComments = async () => {
    try {
      const response = await fetch(`${COMMENTS_URL}?action=get&product_id=${productId}`);
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error('Ошибка загрузки комментариев:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${COMMENTS_URL}?action=add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          user_id: user.id,
          comment_text: newComment,
          rating
        })
      });

      const data = await response.json();
      if (data.success) {
        setComments([data.comment, ...comments]);
        setNewComment('');
        setRating(5);
      }
    } catch (err) {
      console.error('Ошибка добавления комментария:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">Отзывы</h3>

      {user ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Оставить отзыв</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddComment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Оценка</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-2xl transition-colors"
                    >
                      {star <= rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ваш отзыв..."
                required
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Icon name="Loader2" className="animate-spin" size={16} />
                    <span className="ml-2">Отправка...</span>
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={16} />
                    <span className="ml-2">Отправить</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground mb-4">Войдите, чтобы оставить отзыв</p>
            <Button onClick={onLoginClick}>
              <Icon name="LogIn" size={16} />
              <span className="ml-2">Войти</span>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Пока нет отзывов</p>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{comment.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  {comment.rating && (
                    <div className="flex">
                      {Array.from({ length: comment.rating }).map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm">{comment.text}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
