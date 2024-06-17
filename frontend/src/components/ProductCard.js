import React, {Component} from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import {Link} from 'react-router-dom';
import Rating from './Rating';
import axios from '../instance';
import {Store} from '../Store';
import ProductPrice from "./Price";
import ProductImage from "./ProductImage";

class ProductCard extends Component {
    static contextType = Store;

    addToCartHandler = async (item, type) => {
        const {state, dispatch: ctxDispatch} = this.context;
        const {
            cart: {cartItems},
        } = state;
        let itemExist;

        if (type === "product") {
            itemExist = cartItems.find((x) => x._id === item._id);
        } else {
            const bouquetNumber = localStorage.getItem('bouquetNumber');
            itemExist = cartItems.find((x) => x._id === item._id && x.bouquetNumber === bouquetNumber);
        }
        const quantity = itemExist ? itemExist.quantity + 1 : 1;
        const {data} = await axios.get(`/api/${type}s/${item._id}`);

        if (data.countInStock < quantity) {
            window.alert('Sorry. Product is out of stock');
            return;
        }

        ctxDispatch({
            type: 'CART_ADD_ITEM',
            payload: {...item, quantity, type},
        });
    };

    render() {
        const {item} = this.props;
        const {type} = this.props;
        return (
            <Card>
                <Link to={`/${type}/${item.slug}`}>
                    <ProductImage source={item.image} className="card-img-top" alt={item.name}/>
                </Link>
                <Card.Body>
                    <Link to={`/${type}/${item.slug}`}>
                        <Card.Title className="cardTitle-price">{item.name}</Card.Title>
                    </Link>
                    <Rating rating={item.rating} numReviews={item.numReviews}/>
                    <Card.Text>
                        <ProductPrice price={item.price}/>
                    </Card.Text>
                    <div className="d-grid gap-2">
                        {item.countInStock === 0 ? (
                            <Button variant="light" disabled>
                                Out of stock
                            </Button>
                        ) : (
                            <Button
                                variant="outline-primary"
                                onClick={() => this.addToCartHandler(item, type)}
                            >
                                Add to cart
                            </Button>
                        )}
                    </div>
                </Card.Body>
            </Card>
        );
    }
}

export default ProductCard;
