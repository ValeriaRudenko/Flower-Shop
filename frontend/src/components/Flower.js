import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import axios from 'axios';
import React, { useContext } from 'react';
import { Store } from '../Store';
import ProductPrice from "./Price";
import ProductImage from "./ProductImage";

export default function Flower(props) {
    const { flower } = props;
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const {
        cart: { cartItems },
    } = state;

    // Function to handle adding a flower to the cart
    // Функція для додавання квітки до кошика
    const addToCartHandler = async (item) => {
        // Check if the item already exists in the cart
        // Перевіряємо, чи вже є товар у кошику
        const itemExist = cartItems.find((x) => x._id === flower._id);
        // Determine the quantity of the item
        // Визначаємо кількість товару
        const quantity = itemExist ? itemExist.quantity + 1 : 1;
        // Fetch the latest data of the flower from the server
        // Отримуємо оновлені дані квітки з сервера
        const { data } = await axios.get(`/api/flowers/${item._id}`);
        const type= 'flower'
        // Check if the flower is still in stock
        // Перевіряємо, чи квітка все ще є в наявності
        if (data.countInStock < quantity) {
            window.alert('Sorry. Product is out of stock');
            return;
        }
        // Dispatch an action to add the flower to the cart
        // Відправляємо дію для додавання квітки до кошика
        ctxDispatch({
            type: 'CART_ADD_ITEM',
            payload: { ...flower, quantity, type },
        });
    };
console.log(flower.name)
    // Render the flower card component
    // Відображення компонента карточки квітки
    return (
        <Card>
            <Link to={`/flower/${flower.slug}`}>
                <ProductImage  source={flower.image} className="card-img-top"  alt={flower.name} />
            </Link>
            <Card.Body>
                <Link to={`/flower/${flower.slug}`}>
                    <Card.Title className="cardTitle-price">{flower.name}</Card.Title>
                </Link>
                <Rating rating={flower.rating} numReviews={flower.numReviews} />
                <Card.Text>
                    {/* Render the price component */}
                    {/* Відображення компонента ціни */}
                    <ProductPrice
                        price={flower.price}
                    ></ProductPrice>
                </Card.Text>
                <div className="d-grid gap-2">
                    {/* Render the button based on the availability of the flower */}
                    {/* Відображення кнопки залежно від доступності квітки */}
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