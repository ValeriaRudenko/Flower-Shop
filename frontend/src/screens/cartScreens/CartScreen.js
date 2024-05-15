import React, { useContext } from 'react';
import { Store } from '../../Store';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/esm/ListGroupItem';
import Card from 'react-bootstrap/esm/Card';
import MessageBox from '../../components/MessageBox';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductPrice from "../../components/Price";

export default function CartScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart: { cartItems } } = state;

  const updateCartHandler = async (item, quantity) => {
    const type = item.type;
    let endpoint;
    if (type === 'flower') {
      endpoint = `/api/flowers/${item._id}`;
    } else if (type === 'packing') {
      endpoint = `/api/packings/${item._id}`;
    } else {
      endpoint = `/api/products/${item._id}`;
    }
    const { data } = await axios.get(endpoint);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity, type },
    });
  };

  const removeItemHandler = (item) => {
    ctxDispatch({ type: 'CART_REMOVE_ITEM', payload: item });
  };

  const checkoutHandler = () => {
    navigate('/signin?redirect=/shipping');
  };

  // Group cart items by bouquetId
  const groupedCartItems = cartItems.reduce((acc, item) => {
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
        <Helmet>
          <title>Shopping Basket</title>
        </Helmet>
        <h1>Shopping Basket</h1>
        <Row>
          <Col md={8}>
            {cartItems.length === 0 ? (
                <MessageBox>
                  Your basket is empty. <Link to="/">Go Shopping</Link>
                </MessageBox>
            ) : (
                <ListGroup>
                  {Object.keys(groupedCartItems).map((groupId, index) => (
                      <ListGroupItem key={groupId}>
                        <Row className="align-items-center">
                          {groupedCartItems[groupId][0].type === 'product' ? (
                              <>
                                <Col md={4}>
                                  <img
                                      src={groupedCartItems[groupId][0].image}
                                      alt={groupedCartItems[groupId][0].name}
                                      className="img-fluid rounded img-thumbnail"
                                  />
                                </Col>
                                <Col md={4}>
                                  <Link to={`/product/${groupedCartItems[groupId][0].slug}`}> {groupedCartItems[groupId][0].name}</Link>
                                </Col>
                                <Col md={3}>
                                  <Button
                                      variant="light"
                                      onClick={() =>
                                          updateCartHandler(groupedCartItems[groupId][0], groupedCartItems[groupId][0].quantity - 1)
                                      }
                                      disabled={groupedCartItems[groupId][0].quantity === 1}
                                  >
                                    <i className="fas fa-minus-circle"></i>
                                  </Button>
                                  {' '}
                                  <span>{groupedCartItems[groupId][0].quantity}</span>
                                  {' '}
                                  <Button
                                      variant="light"
                                      onClick={() =>
                                          updateCartHandler(groupedCartItems[groupId][0], groupedCartItems[groupId][0].quantity + 1)
                                      }
                                  >
                                    <i className="fas fa-plus-circle"></i>
                                  </Button>
                                  {' '}
                                </Col>
                                <Col md={3}>
                                  <ProductPrice
                                      price={groupedCartItems[groupId][0].price}
                                  ></ProductPrice>
                                </Col>
                                <Col md={2}>
                                  <Button
                                      variant="light"
                                      onClick={() => removeItemHandler(groupedCartItems[groupId][0])}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </Button>
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
                                        <Button
                                            variant="light"
                                            onClick={() =>
                                                updateCartHandler(item, item.quantity - 1)
                                            }
                                            disabled={item.quantity === 1}
                                        >
                                          <i className="fas fa-minus-circle"></i>
                                        </Button>
                                        {' '}
                                        <Button
                                            variant="light"
                                            onClick={() =>
                                                updateCartHandler(item, item.quantity + 1)
                                            }
                                        >
                                          <i className="fas fa-plus-circle"></i>
                                        </Button>
                                      </li>
                                  ))}
                                </ul>
                                <h6>Total Price: <ProductPrice price={groupedCartItems[groupId]
                                    .reduce((a, c) => a + c.price * c.quantity, 0)} /></h6>
                              </Col>
                          )}
                        </Row>
                      </ListGroupItem>
                  ))}
                </ListGroup>
            )}
          </Col>
          <Col md={4}>
            <Card>
              <Card.Body>
                <ListGroup>
                  <ListGroup.Item>
                    <h3>
                      Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)} items) :
                      <ProductPrice price={cartItems.reduce((a, c) => a + c.price * c.quantity, 0)} />
                    </h3>
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <div className="d-grid">
                      <Button
                          type="button"
                          variant="outline-primary"
                          disabled={cartItems.length === 0}
                          onClick={checkoutHandler}
                      >
                        Proceed to Checkout
                      </Button>
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
  );
}
