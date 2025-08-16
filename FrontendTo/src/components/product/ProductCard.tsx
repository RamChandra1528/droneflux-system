import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/database';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
  };

  const currentPrice = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <Link to={`/product/${product.id}`}>
        <div className="relative">
          <AspectRatio ratio={1}>
            <img 
              src={product.image_url || '/placeholder.svg'} 
              alt={product.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          </AspectRatio>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <Badge variant="destructive" className="text-xs font-bold">
                -{discountPercentage}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="text-xs font-bold bg-accent text-accent-foreground">
                Featured
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          {user && (
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // TODO: Add to wishlist
              }}
            >
              <Heart className="w-4 h-4" />
            </Button>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            {/* Brand & Category */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="capitalize">{product.brand}</span>
              <span className="capitalize">{product.category}</span>
            </div>

            {/* Product Name */}
            <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${
                      i < Math.round(product.rating) 
                        ? 'fill-accent text-accent' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.review_count})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                ${currentPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="text-xs">
              {product.stock_quantity > 0 ? (
                <span className="text-success">In Stock ({product.stock_quantity} left)</span>
              ) : (
                <span className="text-destructive">Out of Stock</span>
              )}
            </div>
          </div>
        </CardContent>
      </Link>

      {/* Add to Cart Button */}
      <div className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0 || !user}
          className="w-full group-hover:bg-primary-glow transition-colors"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;