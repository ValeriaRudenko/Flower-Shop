import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Store } from '../../Store';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../../components/CheckoutSteps';

export default function ShippingAddressScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    fullBox,
    userInfo,
    cart: { shippingAddress },
  } = state;

  const [fullName, setFullName] = useState(shippingAddress.fullName || '');
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [paymentMethod, setPaymentMethod] = useState('PayPal'); // State for payment method

  useEffect(() => {
    if (!userInfo) {
      navigate('/signin?redirect=/shipping');
    }
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [userInfo, shippingAddress, navigate]);

  const submitHandler = (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        fullName,
        address,
        city,
        location: shippingAddress.location,
      },
    });
    ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethod });

    localStorage.setItem(
        'shippingAddress',
        JSON.stringify({
          fullName,
          address,
          city,
          location: shippingAddress.location,
        })
    );
    localStorage.setItem('paymentMethod', paymentMethod);

    navigate('/placeorder');
  };

  useEffect(() => {
    ctxDispatch({ type: 'SET_FULLBOX_OFF' });
  }, [ctxDispatch, fullBox]);

  return (
      <div>
        <Helmet>
          <title>Shipping Address</title>
        </Helmet>
        <CheckoutSteps step1 step2></CheckoutSteps>
        <div className="container small-container">
          <h1 className="my-3">Shipping Address</h1>
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="fullName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="city">
              <Form.Label>City</Form.Label>
              <Form.Control
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
              />
            </Form.Group>

            {/* Form group for payment method selection */}
            <Form.Group className="mb-3" controlId="paymentMethod">
              <Form.Label>Payment Method</Form.Label>
              <div>
                <Form.Check
                    type="radio"
                    id="PayPal"
                    label="PayPal"
                    value="PayPal"
                    checked={paymentMethod === 'PayPal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                />
                <Form.Check
                    type="radio"
                    id="Cash"
                    label="Cash"
                    value="Cash"
                    checked={paymentMethod === 'Cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                />
              </div>
            </Form.Group>

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
