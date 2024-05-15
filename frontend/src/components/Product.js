import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import axios from 'axios';
import React, { useContext } from 'react';
import { Store } from '../Store';
import ProductPrice from "./Price";
import Flower from "./Flower";
import ProductImage from "./ProductImage";

export default function Product(props) {
  const { product } = props;
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

// Function to handle adding a product to the cart
// Функція для додавання товару до кошика
  const addToCartHandler = async (item) => {
    // Check if the item already exists in the cart
    // Перевіряємо, чи вже є товар у кошику
    const itemExist = cartItems.find((x) => x._id === product._id);
    // Determine the quantity of the item
    // Визначаємо кількість товару
    const quantity = itemExist ? itemExist.quantity + 1 : 1;
    // Fetch the latest data of the product from the server
    // Отримуємо оновлені дані товару з сервера
    const { data } = await axios.get(`/api/products/${item._id}`);
    const type= 'product'
    // Check if the product is still in stock
    // Перевіряємо, чи товар все ще є в наявності
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    // Dispatch an action to add the product to the cart
    // Відправляємо дію для додавання товару до кошика
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity, type },
    });
  };
// Render the product card component
// Відображення компонента карточки товару
  return (
      <Card>
        <Link to={`/product/${product.slug}`}>
          <ProductImage  source={product.image} className="card-img-top"  alt={product.name} />
        </Link>
        <Card.Body>
          <Link to={`/product/${product.slug}`}>
            <Card.Title className="cardTitle-price">{product.name}</Card.Title>
          </Link>
          <Rating rating={product.rating} numReviews={product.numReviews} />
          <Card.Text>
            <ProductPrice
                price={product.price}
            ></ProductPrice>
          </Card.Text>
          <div className="d-grid gap-2">
            {product.countInStock === 0 ? (
                <Button variant="light" disabled>
                  Out of stock
                </Button>
            ) : (
                <Button
                    variant="outline-primary"
                    onClick={() => addToCartHandler(product)}
                >
                  Add to cart
                </Button>
            )}
          </div>
        </Card.Body>
      </Card>
  );
}
