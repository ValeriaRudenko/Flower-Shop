import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import axios from 'axios';
import React, { useContext } from 'react';
import { Store } from '../Store';
import ProductPrice from "./Price";

export default function Flower(props) {
    const { flower } = props;
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const {
        cart: { cartItems },
    } = state;

    const addToCartHandler = async (item) => {
        const itemExist = cartItems.find((x) => x._id === flower._id);
        const quantity = itemExist ? itemExist.quantity + 1 : 1;
        const { data } = await axios.get(`/api/flowers/${item._id}`);
        // const type= 'flower'
        if (data.countInStock < quantity) {
            window.alert('Sorry. Product is out of stock');
            return;
        }
        ctxDispatch({
            type: 'CART_ADD_ITEM',
            payload: { ...flower, quantity },
        });
    };

    return (
        <Card>
            <Link to={`/flower/${flower.slug}`}>
                <img src={flower.image} className="card-img-top"  alt={flower.name} />
            </Link>
            <Card.Body>
                <Link to={`/flower/${flower.slug}`}>
                    <Card.Title className="cardTitle-price">{flower.name}</Card.Title>
                </Link>
                <Rating rating={flower.rating} numReviews={flower.numReviews} />
                <Card.Text>
                    <ProductPrice
                        price={flower.price}
                    ></ProductPrice>
                </Card.Text>
                <div className="d-grid gap-2">
                    {flower.countInStock === 0 ? (
                        <Button variant="light" disabled>
                            Out of stock
                        </Button>
                    ) : (
                        <Button
                            variant="outline-primary"
                            onClick={() => addToCartHandler(flower)}
                        >
                            Add to cart
                        </Button>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
}