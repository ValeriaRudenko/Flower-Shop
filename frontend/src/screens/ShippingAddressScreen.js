// Import necessary components and libraries
import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Store } from '../Store';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../components/CheckoutSteps';

// Define functional component for Payment and Shipping screen
export default function PaymentAndShippingScreen() {
  // Initialize navigate function to navigate between routes
  const navigate = useNavigate();
  // Retrieve state and dispatch function from global store context
  const { state, dispatch: ctxDispatch } = useContext(Store);
  // Destructure necessary state variables from the global state
  const {
    fullBox,
    userInfo,
    cart: { shippingAddress },
  } = state;

  // Initialize local state variables to manage form inputs
  const [fullName, setFullName] = useState(shippingAddress.fullName || '');
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');

  // Effect hook to handle redirection if user info or shipping address is missing
  useEffect(() => {
    if (!userInfo) {
      navigate('/signin?redirect=/shipping');
    }
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [userInfo, shippingAddress, navigate]);

  // Function to handle form submission
  const submitHandler = (e) => {
    // Dispatch action to save shipping address to global state
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        fullName,
        address,
        city,
        location: shippingAddress.location,
      },
    });
    // Store shipping address in local storage
    localStorage.setItem(
        'shippingAddress',
        JSON.stringify({
          fullName,
          address,
          city,
          location: shippingAddress.location,
        })
    );
    // Navigate to the place order screen
    navigate('/placeorder');
  };

  // Effect hook to set full box off when component mounts or fullBox changes
  useEffect(() => {
    ctxDispatch({ type: 'SET_FULLBOX_OFF' });
  }, [ctxDispatch, fullBox]);

  // Render JSX elements
  return (
      <div>
        {/* Helmet for setting the page title */}
        <Helmet>
          <title>Shipping Address</title>
        </Helmet>
        {/* Component for displaying checkout steps */}
        <CheckoutSteps step1 step2></CheckoutSteps>
        <div className="container small-container">
          {/* Heading for the shipping address section */}
          <h1 className="my-3">Shipping Address</h1>
          {/* Form for entering shipping address */}
          <Form onSubmit={submitHandler}>
            {/* Form group for full name input */}
            <Form.Group className="mb-3" controlId="fullName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
              />
            </Form.Group>
            {/* Form group for address input */}
            <Form.Group className="mb-3" controlId="address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
              />
            </Form.Group>
            {/* Form group for city input */}
            <Form.Group className="mb-3" controlId="city">
              <Form.Label>City</Form.Label>
              <Form.Control
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
              />
            </Form.Group>
            {/* Button to submit the form */}
            <div className="mb-3">
              <Button variant="outline-primary" type="submit">
                Continue
              </Button>
            </div>
          </Form>
        </div>
      </div>
  );
}
