import React, { useContext } from 'react'; // Importing React and useContext hook
import { Store } from '../Store'; // Importing Store context
import { Helmet } from 'react-helmet-async'; // Importing Helmet component for managing document head meta tags
import Row from 'react-bootstrap/Row'; // Importing Row component from React Bootstrap
import Col from 'react-bootstrap/Col'; // Importing Col component from React Bootstrap
import Button from 'react-bootstrap/Button'; // Importing Button component from React Bootstrap
import ListGroup from 'react-bootstrap/ListGroup'; // Importing ListGroup component from React Bootstrap
import ListGroupItem from 'react-bootstrap/esm/ListGroupItem'; // Importing ListGroupItem component from React Bootstrap
import Card from 'react-bootstrap/esm/Card'; // Importing Card component from React Bootstrap
import MessageBox from '../components/MessageBox'; // Importing MessageBox component
import { Link, useNavigate } from 'react-router-dom'; // Importing necessary components from React Router for navigation
import axios from 'axios'; // Importing axios for making HTTP requests
import ProductPrice from "../components/Price"; // Importing ProductPrice component
import Product from "../components/Product"; // Importing Product component

// CartScreen component
export default function CartScreen() {
  // Using useNavigate hook from React Router DOM for navigation
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store); // Accessing global state and dispatch function from Store context
  const {
    // Destructuring cartItems from state
    cart: { cartItems },
  } = state;

  // Handler to update quantity of items in the cart
  const updateCartHandler = async (item, quantity) => {
    console.log(item, quantity)
    const type = item.type;
    let endpoint;
    // Determining endpoint based on item type
    if (type === 'flower') {
      endpoint = `/api/flowers/${item._id}`;
    } else if (type === 'packing') {
      endpoint = `/api/packings/${item._id}`;
    } else {
      endpoint = `/api/products/${item._id}`;
    }
    // Fetching data from the server
    const { data } = await axios.get(endpoint);
    // Checking if the requested quantity exceeds the available stock
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    // Dispatching action to add item to the cart
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity, type },
    });
  };

  // Handler to remove item from the cart
  const removeItemHandler = (item) => {
    ctxDispatch({ type: 'CART_REMOVE_ITEM', payload: item });
  };

  // Handler to proceed to checkout
  // Redirecting to sign-in page with redirection to shipping page after sign-in
  const checkoutHandler = () => {
    navigate('/signin?redirect=/shipping');
  };

  return (
      <div>
        <Helmet> {/* Helmet component to manage document head meta tags */}
          <title>Shopping Basket</title> {/* Setting document title */}
        </Helmet>
        <h1>Shopping Basket</h1> {/* Heading for cart screen */}
        <Row> {/* Row for displaying cart items and summary */}
          <Col md={8}>
            {cartItems.length === 0 ? ( // Checking if cart is empty
                <MessageBox> {/* Displaying message if cart is empty */}
                  Your basket is empty. <Link to="/">Go Shopping</Link> {/* Link to go back to shopping */}
                </MessageBox>
            ) : (
                <ListGroup> {/* Displaying cart items */}
                  {cartItems.map((item) => ( // Mapping through cart items
                      <ListGroupItem key={item.slug}> {/* List group item for each cart item */}
                        <Row className="align-items-center"> {/* Row for each cart item */}
                          <Col md={4}>
                            <img
                                src={item.image}
                                alt={item.name}
                                className="img-fluid rounded img-thumbnail"
                            />
                            {''}
                            <Link to={`/product/${item.slug}`}> {item.name}</Link> {/* Link to view product details */}
                          </Col>
                          <Col md={3}>
                            <Button
                                variant="light"
                                onClick={() =>
                                    updateCartHandler(item, item.quantity - 1)
                                }
                                disabled={item.quantity === 1}
                            >
                              <i className="fas fa-minus-circle"></i> {/* Button to decrease quantity */}
                            </Button>
                            {''}
                            <span>{item.quantity}</span> {/* Displaying quantity */}
                            {''}
                            <Button
                                variant="light"
                                onClick={() =>
                                    updateCartHandler(item, item.quantity + 1)
                                }
                            >
                              <i className="fas fa-plus-circle"></i> {/* Button to increase quantity */}
                            </Button>
                            {''}
                          </Col>
                          <Col md={3}>
                            <ProductPrice
                                price={item.price}
                            ></ProductPrice> {/* Displaying item price */}
                          </Col>
                          <Col md={2}>
                            <Button
                                variant="light"
                                onClick={() => removeItemHandler(item)}
                            >
                              <i className="fas fa-trash"></i> {/* Button to remove item from cart */}
                            </Button>
                          </Col>
                        </Row>
                      </ListGroupItem>
                  ))}
                </ListGroup>
            )}
          </Col>
          <Col md={4}>
            <Card> {/* Card for displaying order summary */}
              <Card.Body>
                <ListGroup>
                  <ListGroup.Item>
                    <h3>
                      Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)} items) :
                      <ProductPrice price={cartItems.reduce((a, c) => a + c.price * c.quantity, 0)} />
                    </h3> {/* Displaying subtotal */}
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
                      </Button> {/* Button to proceed to checkout */}
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
