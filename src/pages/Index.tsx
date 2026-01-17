import { useState } from 'react';
import { AuthModal } from '@/components/AuthModal';
import { ProductComments } from '@/components/ProductComments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import Icon from '@/components/ui/icon';

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: 'donate' | 'account';
  badge?: string;
};



const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authToken, setAuthToken] = useState<string>('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const products: Product[] = [
    {
      id: 'nill-donate',
      name: 'Донат NILL',
      price: 600,
      description: 'Премиум донат для сервера IriskaWorld с эксклюзивными привилегиями',
      category: 'donate',
      badge: 'Популярный'
    },
    {
      id: 'dragon-donate',
      name: 'Донат Dragon',
      price: 350,
      description: 'Эксклюзивный донат Dragon для сервера SeroWorld с уникальными возможностями',
      category: 'donate',
      badge: 'Новинка'
    },
    {
      id: 'fair-donate',
      name: 'Донат FAIR',
      price: 400,
      description: 'Донат FAIR для IriskaWorld с расширенными привилегиями и бонусами',
      category: 'donate'
    },
    {
      id: 'charm-account',
      name: 'Аккаунт CharmGrief',
      price: 450,
      description: 'Аккаунт с Д.Хелпером (ограниченный доступ к серверу)',
      category: 'account',
      badge: 'Новинка'
    },
    {
      id: 'styt-account',
      name: 'Аккаунт STYT',
      price: 500,
      description: 'Ник STYT с донатом Д.Хелпера на CharmGrief (почти фулл права хелпера)',
      category: 'account',
      badge: 'Топ'
    },
    {
      id: 'iriska-premium',
      name: 'Премиум аккаунт IriskaWorld',
      price: 450,
      description: 'Аккаунт с VIP статусом и эксклюзивными возможностями на IriskaWorld',
      category: 'account'
    },
    {
      id: 'fands-elite',
      name: 'Elite аккаунт FandsWorld',
      price: 550,
      description: 'Элитный аккаунт с уникальными привилегиями и донатами на FandsWorld',
      category: 'account',
      badge: 'Редкий'
    },
    {
      id: 'aster-mega',
      name: 'Mega аккаунт AsterWorld',
      price: 480,
      description: 'Аккаунт с Mega статусом и полным набором донатов на AsterWorld',
      category: 'account'
    }
  ];

  const handlePurchase = async (product: Product) => {
    setIsProcessing(true);
    try {
      const response = await fetch('https://functions.poehali.dev/e0bf1917-6e0d-4d9f-9e79-254850a97db0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          price: product.price
        })
      });
      const data = await response.json();
      if (data.telegramUrl) {
        window.location.href = data.telegramUrl;
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const reviews = [
    { id: 1, author: 'Steve_228', rating: 5, text: 'Отличный магазин! Донат пришёл мгновенно, всё работает.' },
    { id: 2, author: 'Herobrine_Pro', rating: 5, text: 'Купил аккаунт для CharmGrief, всё чётко, рекомендую!' },
    { id: 3, author: 'Creeper_King', rating: 4, text: 'Хороший сервис, быстрая доставка, цены адекватные.' }
  ];

  const scrollToSection = (section: string) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAuthSuccess = (userData: any, token: string) => {
    setUser(userData);
    setAuthToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 w-full z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src="https://cdn.poehali.dev/projects/7d73a09f-00e1-405b-889e-3434c3398a1f/files/2428c9f2-fabe-42dc-b908-c1cfbf111ac3.jpg" 
                alt="MCShop Logo" 
                className="w-10 h-10 pixel-corners object-cover"
              />
              <h1 className="text-2xl font-bold text-glow">MCShop</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              {['home', 'products', 'about', 'reviews'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    activeSection === section ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {section === 'home' ? 'Главная' : 
                   section === 'products' ? 'Товары' :
                   section === 'about' ? 'О нас' : 'Отзывы'}
                </button>
              ))}
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{user.username}</span>
                  <Button size="sm" variant="outline" onClick={handleLogout}>
                    <Icon name="LogOut" size={16} />
                  </Button>
                </div>
              ) : (
                <Button size="sm" onClick={() => setIsAuthModalOpen(true)}>
                  <Icon name="User" size={16} />
                  <span className="ml-2">Войти</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section id="home" className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-8 inline-block">
            <img 
              src="https://cdn.poehali.dev/projects/7d73a09f-00e1-405b-889e-3434c3398a1f/files/2428c9f2-fabe-42dc-b908-c1cfbf111ac3.jpg" 
              alt="MCShop" 
              className="w-32 h-32 pixel-corners mx-auto mb-6 object-cover glow-effect"
            />
          </div>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 text-glow">
            Всё для Minecraft
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Донаты, аккаунты и привилегии для популярных серверов. Мгновенная доставка, безопасные платежи.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              className="pixel-corners hover-scale text-lg"
              onClick={() => scrollToSection('products')}
            >
              <Icon name="ShoppingCart" size={20} />
              <span className="ml-2">Перейти в магазин</span>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="pixel-corners hover-scale text-lg"
              onClick={() => scrollToSection('about')}
            >
              <Icon name="Info" size={20} />
              <span className="ml-2">Узнать больше</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Card className="pixel-corners hover-scale bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="text-4xl mb-2">⚡</div>
                <CardTitle>Мгновенная доставка</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Получите товар сразу после оплаты</p>
              </CardContent>
            </Card>
            <Card className="pixel-corners hover-scale bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="text-4xl mb-2">🔒</div>
                <CardTitle>Безопасность</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Защищённые платежи и гарантия качества</p>
              </CardContent>
            </Card>
            <Card className="pixel-corners hover-scale bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="text-4xl mb-2">💬</div>
                <CardTitle>Поддержка 24/7</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Всегда готовы помочь с любым вопросом</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="products" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-glow">Наши товары</h2>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="donate">Донаты</TabsTrigger>
              <TabsTrigger value="account">Аккаунты</TabsTrigger>
            </TabsList>
            
            {['all', 'donate', 'account'].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products
                    .filter(p => tab === 'all' || p.category === tab)
                    .map((product) => (
                      <Card key={product.id} className="pixel-corners hover-scale overflow-hidden border-2 border-border hover:border-primary transition-colors">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-2xl mb-2">{product.name}</CardTitle>
                              {product.badge && (
                                <Badge className="mb-2">{product.badge}</Badge>
                              )}
                            </div>
                            <div className="text-3xl">
                              {product.category === 'donate' ? '💎' : '👤'}
                            </div>
                          </div>
                          <CardDescription className="text-base">{product.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <p className="text-3xl font-bold text-primary">{product.price}₽</p>
                            </div>
                            <Button 
                              className="pixel-corners hover-scale"
                              onClick={() => handlePurchase(product)}
                              disabled={isProcessing}
                            >
                              <Icon name="ShoppingCart" size={18} />
                              <span className="ml-2">{isProcessing ? 'Обработка...' : 'Купить'}</span>
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setSelectedProduct(product)}
                          >
                            <Icon name="MessageCircle" size={16} />
                            <span className="ml-2">Отзывы</span>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <section id="about" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-glow">О нас</h2>
          <Card className="pixel-corners p-8">
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-muted-foreground mb-4">
                MCShop — это надёжный магазин товаров для Minecraft с многолетним опытом работы. 
                Мы специализируемся на продаже донатов и аккаунтов для популярных серверов.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">✅</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Проверенное качество</h3>
                    <p className="text-muted-foreground">Все товары тщательно проверены перед продажей</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">🚀</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Быстрая доставка</h3>
                    <p className="text-muted-foreground">Автоматическая выдача товара после оплаты</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">💰</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Честные цены</h3>
                    <p className="text-muted-foreground">Лучшие цены на рынке без скрытых комиссий</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">🛡️</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Гарантия возврата</h3>
                    <p className="text-muted-foreground">Вернём деньги, если что-то пойдёт не так</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section id="reviews" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-glow">Отзывы</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <Card key={review.id} className="pixel-corners hover-scale">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">{review.author}</CardTitle>
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-500">⭐</span>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{review.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img 
              src="https://cdn.poehali.dev/projects/7d73a09f-00e1-405b-889e-3434c3398a1f/files/2428c9f2-fabe-42dc-b908-c1cfbf111ac3.jpg" 
              alt="MCShop Logo" 
              className="w-10 h-10 pixel-corners object-cover"
            />
            <h3 className="text-2xl font-bold text-glow">MCShop</h3>
          </div>
          <p className="text-muted-foreground mb-4">Всё для Minecraft в одном месте</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Icon name="Mail" size={24} />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Icon name="MessageCircle" size={24} />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Icon name="Send" size={24} />
            </a>
          </div>
          <p className="text-sm text-muted-foreground mt-6">© 2026 MCShop. Все права защищены.</p>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProduct.name}</DialogTitle>
              <DialogDescription>{selectedProduct.description}</DialogDescription>
            </DialogHeader>
            <ProductComments
              productId={selectedProduct.id}
              user={user}
              onLoginClick={() => {
                setSelectedProduct(null);
                setIsAuthModalOpen(true);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Index;