import React, { useEffect, useReducer } from 'react';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Flower from '../components/Flower';
import Packing from '../components/Packing';
import Container from "react-bootstrap/Container";

// Reducer function to manage component state
const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, packings: action.payload.packings, flowers: action.payload.flowers, loading: false };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

export default function CreateBouquetScreen() {
    // Using useReducer hook to manage component state
    const [{ loading, error, packings, flowers }, dispatch] = useReducer(reducer, {
        packings: [],
        flowers: [],
        loading: true,
        error: '',
    });
// Using useEffect hook to perform side effects like fetching data from server
    useEffect(() => {
        const fetchData = async () => {
            dispatch({ type: 'FETCH_REQUEST' });
            try {
                // Fetching flower data from server
                const flowersResult = await axios.get('/api/flowers');
                // Fetching packing data from server
                const packingsResult = await axios.get('/api/packings');
                // Merging fetched data
                const mergedData = {
                    packings: packingsResult.data,
                    flowers: flowersResult.data,
                };
                // Dispatching action indicating successful data fetching along with fetched data
                dispatch({ type: 'FETCH_SUCCESS', payload: mergedData });
            } catch (error) {
                // Dispatching action indicating failed data fetching along with error message
                dispatch({ type: 'FETCH_FAIL', payload: error.message });
            }
        };
        // Calling the function to fetch data when the component mounts
        fetchData();
    }, []);

    // Returning JSX code to render the component
    return (
        <div>
            <img
                src="/main.jpg"
                className="Flowers"
                alt=""
            />
            <Container>
                <Helmet>
                    <title> Flower & Packing Boutique</title>
                </Helmet>
                <div className="items">
                    <h1>Items</h1>
                    {loading ? (
                        <LoadingBox />
                    ) : error ? (
                        <MessageBox variant="danger">{error}</MessageBox>
                    ) : (
                        <Row>
                            {packings.map((packing) => (
                                <Col key={packing.slug} sm={6} md={4} lg={3} className="mb-3">
                                    <Packing packing={packing}></Packing>
                                </Col>
                            ))}
                            {flowers.map((flower) => (
                                <Col key={flower.slug} sm={6} md={4} lg={3} className="mb-3">
                                    <Flower flower={flower}></Flower>
                                </Col>
                            ))}
                        </Row>
                    )}
                </div>
            </Container>
        </div>
    );
}
