import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import axios from 'axios';
import React, { useContext } from 'react';
import { Store } from '../Store';
import ProductPrice from "./Price";


export default function Packing(props) {
    const { packing } = props;
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const {
        cart: { cartItems },
    } = state;

    const addToCartHandler = async (item) => {
        const itemExist = cartItems.find((x) => x._id === packing._id);
        const quantity = itemExist ? itemExist.quantity + 1 : 1;
        const { data } = await axios.get(`/api/packing/${item._id}`);
        const type= 'packing'
        if (data.countInStock < quantity) {
            window.alert('Sorry. Product is out of stock');
            return;
        }
        ctxDispatch({
            type: 'CART_ADD_ITEM',
            payload: { ...packing, quantity, type },
        });
    };

    return (
        <Card>
            <Link to={`/packing/${packing.slug}`}>
                <img src={packing.image} className="card-img-top"  alt={packing.name} />
            </Link>
            <Card.Body>
                <Link to={`/packing/${packing.slug}`}>
                    <Card.Title className="cardTitle-price">{packing.name}</Card.Title>
                </Link>
                <Rating rating={packing.rating} numReviews={packing.numReviews} />
                <Card.Text>
                    <ProductPrice
                        price={packing.price}
                    ></ProductPrice>
                </Card.Text>
                <div className="d-grid gap-2">
                    {packing.countInStock === 0 ? (
                        <Button variant="light" disabled>
                            Out of stock
                        </Button>
                    ) : (
                        <Button
                            variant="outline-primary"
                            onClick={() => addToCartHandler(packing)}
                        >
                            Add to cart
                        </Button>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
}