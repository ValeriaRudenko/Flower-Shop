import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import axios from 'axios';
import React, { useContext } from 'react';
import { Store } from '../Store';
import ProductPrice from "./Price";
import Flower from "./Flower";

export default function Product(props) {
  const { product } = props;
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const addToCartHandler = async (item) => {
    const itemExist = cartItems.find((x) => x._id === product._id);
    const quantity = itemExist ? itemExist.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${item._id}`);
    const type= 'product'
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity, type },
    });
  };

  return (
      <Card>
        <Link to={`/product/${product.slug}`}>
          <img src={product.image} className="card-img-top"  alt={product.name} />
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
