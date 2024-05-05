import React, { useContext, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import CheckoutSteps from '../components/CheckoutSteps';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getError } from './utils';
import LoadingBox from '../components/LoadingBox';
import Axios from 'axios';
import ProductPrice from "../components/Price";

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true };
    case 'CREATE_SUCCESS':
      return { ...state, loading: false };
    case 'CREATE_FAIL':
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function PlaceOrderScreen() {
  const navigate = useNavigate();
  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23
  cart.itemsPrice = round2(
      cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(20);
  cart.taxPrice = round2(0.0 * cart.itemsPrice);
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;

  const placeOrderHandler = async () => {
    try {
      dispatch({ type: 'CREATE_REQUEST' });

      const { data } = await Axios.post(
          '/api/orders',
          {
            orderItems: cart.cartItems,
            shippingAddress: cart.shippingAddress,
            paymentMethod: cart.paymentMethod,
            itemsPrice: cart.itemsPrice,
            shippingPrice: cart.shippingPrice,
            taxPrice: cart.taxPrice,
            totalPrice: cart.totalPrice,
          },
          {
            headers: {
              authorization: `Bearer ${userInfo.token}`,
            },
          }
      );
      ctxDispatch({ type: 'CART_CLEAR' });
      dispatch({ type: 'CREATE_SUCCESS' });
      localStorage.removeItem('cartItems');
      navigate(`/order/${data.order._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart, navigate]);

  // Group cart items by bouquetId
  const groupedCartItems = cart.cartItems.reduce((acc, item) => {
    if (item.type === 'product') {
      acc[item._id] = [item];
    } else {
      if (!acc[item.bouquetId]) {
        acc[item.bouquetId] = [];
      }
      acc[item.bouquetId].push(item);
    }
    return acc;
  }, {});

  return (
      <div>
        <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
        <Helmet>
          <title>Preview Order</title>
        </Helmet>
        <h1 className="my-3">Preview Order</h1>
        <Row>
          <Col md={8}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Shipping</Card.Title>
                <Card.Text>
                  <strong>Name:</strong> {cart.shippingAddress.fullName} <br />
                  <strong>Address: </strong> {cart.shippingAddress.address},
                  {cart.shippingAddress.city},
                </Card.Text>
                <Link to="/shipping">
                  <Button  variant="outline-primary"
                           type="button">Edit</Button>
                </Link>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Payment</Card.Title>
                <Card.Text>
                  <strong>Method:</strong> {cart.paymentMethod}
                </Card.Text>
                <Link to="/payment">
                  <Button variant="outline-primary"
                          type="button">Change</Button>
                </Link>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Items</Card.Title>
                <ListGroup variant="flush">
                  {Object.keys(groupedCartItems).map((groupId, index) => (
                      <ListGroup.Item key={groupId}>
                        <Row className="align-items-center">
                          {groupedCartItems[groupId][0].type === 'product' ? (
                              <>
                                <Col md={6}>
                                  <img
                                      src={groupedCartItems[groupId][0].image}
                                      alt={groupedCartItems[groupId][0].name}
                                      className="img-fluid rounded img-thumbnail"
                                  ></img>{' '}
                                  <Link to={`/product/${groupedCartItems[groupId][0].slug}`}>{groupedCartItems[groupId][0].name}</Link>
                                </Col>
                                <Col md={3}>
                                  <span>{groupedCartItems[groupId][0].quantity}</span>
                                </Col>
                                <Col md={3}>
                                  <ProductPrice
                                      price={groupedCartItems[groupId][0].price}
                                  ></ProductPrice>
                                  {/*<strong>  {item.price} </strong>*/}
                                </Col>
                              </>
                          ) : (
                              <Col>
                                <h5>Custom Bouquet {index + 1}</h5>
                                <ul>
                                  {groupedCartItems[groupId].map((item) => (
                                      <li key={item._id}>
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="img-fluid rounded img-thumbnail"
                                        />
                                        {item.name} - {item.quantity}
                                        {' '}
                                        <ProductPrice price={item.price}></ProductPrice>
                                        {' '}
                                      </li>
                                  ))}
                                </ul>
                                <h6>Total Price: <ProductPrice price={groupedCartItems[groupId]
                                    .reduce((a, c) => a + c.price * c.quantity, 0)} /></h6>
                              </Col>
                          )}
                        </Row>
                      </ListGroup.Item>
                  ))}
                </ListGroup>
                <Link to="/cart"><Button  variant="outline-primary"
                                          type="button">Edit</Button></Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <Card.Body>
                <Card.Title>Order Summary</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Row>
                      <Col>Items</Col>
                      <Col>€ {cart.itemsPrice.toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Shipping</Col>
                      <Col>€ {cart.shippingPrice.toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Tax</Col>
                      <Col>€ {cart.taxPrice.toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>
                        <strong> Order Total</strong>
                      </Col>
                      <Col>
                        <strong>€ {cart.totalPrice.toFixed(2)}</strong>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <div className="d-grid">
                      <Button
                          variant="outline-primary"
                          type="button"
                          onClick={placeOrderHandler}
                          disabled={cart.cartItems.length === 0}
                      >
                        Place Order
                      </Button>
                    </div>
                    {loading && <LoadingBox></LoadingBox>}
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
  );
}
