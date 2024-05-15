import React, { useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../../components/LoadingBox';
import MessageBox from '../../components/MessageBox';

import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import ProductCard from "../../components/ProductCard";

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
    // State to manage the selected category (flowers, packings, or all)
    const [selectedCategory, setSelectedCategory] = useState('flowers');
    // State variables for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20); // Changed to display only 2 items per page

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


    const filteredItems = () => {
        let filtered = [];
        if (selectedCategory === 'packings') {
            filtered = packings;
        } else {
            filtered = flowers;
        }
        return filtered;
    };

    // Function to handle next page
    const nextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    // Function to handle previous page
    const prevPage = () => {
        setCurrentPage((prevPage) => prevPage - 1);
    };

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
                    <Container>
                        <Row>
                            <Col xs={12} md={3}>
                                <div>
                                    <Button variant="link" onClick={() => setSelectedCategory('flowers')} style={{ textDecoration: 'none', color: ' #114232' }}>
                                        Flowers
                                    </Button>{' '}
                                    <Button variant="link" onClick={() => setSelectedCategory('packings')} style={{ textDecoration: 'none', color: ' #114232' }}>
                                        Packings
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Container>


                    {loading ? (
                        <LoadingBox />
                    ) : error ? (
                        <MessageBox variant="danger">{error}</MessageBox>
                    ) : (
                        <div>
                            <Row>
                                {filteredItems().slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                                    <Col key={item.slug} sm={3} className="mb-3">
                                        {selectedCategory === 'flowers' ? (
                                            <ProductCard item={item} type={'flower'} />
                                        ) : (
                                            <ProductCard item={item} type={'packing'}/>
                                        )}
                                    </Col>
                                ))}
                            </Row>
                            {/* Pagination */}
                            <div className="pagination">
                                {filteredItems().length > itemsPerPage && (
                                    <div className="pagination-list">
                                        <div className="page-item">
                                            <Button variant="link" onClick={prevPage} disabled={currentPage === 1} className="page-link">
                                                Previous
                                            </Button>
                                        </div>
                                        {Array.from({ length: Math.ceil(filteredItems().length / itemsPerPage) }, (_, i) => {
                                            if (i + 1 >= currentPage - 2 && i + 1 <= currentPage + 2) {
                                                return (
                                                    <div key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                                        <Button variant="link" onClick={() => setCurrentPage(i + 1)} className="page-link">
                                                            {i + 1}
                                                        </Button>
                                                    </div>
                                                );
                                            }
                                        })}
                                        <div className="page-item">
                                            <Button variant="link" onClick={nextPage} disabled={currentPage === Math.ceil(filteredItems().length / itemsPerPage)} className="page-link">
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>


                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}
