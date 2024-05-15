import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import axios from 'axios';
import React, { useContext } from 'react';
import { Store } from '../Store';
import ProductPrice from "./Price";
import ProductImage from "./ProductImage";


export default function Packing(props) {
    const { packing } = props;
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const {
        cart: { cartItems },
    } = state;
console.log(packing.name)
    // Function to handle adding a packing to the cart
    // Функція для додавання упаковки до кошика
    const addToCartHandler = async (item) => {
        // Check if the item already exists in the cart
        // Перевіряємо, чи вже є товар у кошику
        const itemExist = cartItems.find((x) => x._id === packing._id);
        // Determine the quantity of the item
        // Визначаємо кількість товару
        const quantity = itemExist ? itemExist.quantity + 1 : 1;
        // Fetch the latest data of the packing from the server
        // Отримуємо оновлені дані упаковки з сервера
        const { data } = await axios.get(`/api/packings/${item._id}`);
        const type= 'packing'
        // Check if the packing is still in stock
        // Перевіряємо, чи упаковка все ще є в наявності
        if (data.countInStock < quantity) {
            window.alert('Sorry. Product is out of stock');
            return;
        }
        // Dispatch an action to add the packing to the cart
        // Відправляємо дію для додавання упаковки до кошика
        ctxDispatch({
            type: 'CART_ADD_ITEM',
            payload: { ...packing, quantity, type },
        });
    };


    // Render the packing card component
    // Відображення компонента карточки упаковки
    return (
        <Card>
            <Link to={`/packing/${packing.slug}`}>
                <ProductImage source={packing.image} className="card-img-top"  alt={packing.name} />
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