import React, { useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Helmet } from 'react-helmet-async';
import LoadingBox from './components/LoadingBox';
import MessageBox from './components/MessageBox';
import Product from './components/Product';
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

import {reducer} from "./components/reducers/ReducerProducts";

export default function BouquetsScreen() {
    const [{ loading, error, products }, dispatch] = useReducer(reducer, {
        products: [],
        loading: true,
        error: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(2); // Changed to display 6 items per page

    useEffect(() => {
        const fetchData = async () => {
            dispatch({ type: 'FETCH_REQUEST' });
            try {
                const result = await axios.get('/api/products');
                dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
            } catch (error) {
                dispatch({ type: 'FETCH_FAIL', payload: error.message });
            }
        };
        fetchData();
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div>
            <img
                src="/main.jpg"
                className="Flowers"
                alt=""
            />
            <Container>
                <Helmet>
                    <title> Flower Boutique</title>
                </Helmet>
                <div className="products">
                    <h1>Flowers</h1>
                    {loading ? (
                        <LoadingBox/>
                    ) : error ? (
                        <MessageBox variant="danger">{error}</MessageBox>
                    ) : (
                        <Row>
                            {currentItems.map((product) => (
                                <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                                    <Product product={product}></Product>
                                </Col>
                            ))}
                        </Row>
                    )}
                    {/* Pagination */}
                    <div className="pagination">
                        {products.length > itemsPerPage && (
                            <div className="pagination-list">
                                <div className="page-item">
                                    <Button variant="link" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="page-link">
                                        Previous
                                    </Button>
                                </div>
                                {Array.from({ length: Math.ceil(products.length / itemsPerPage) }, (_, i) => (
                                    <div key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                        <Button variant="link" onClick={() => paginate(i + 1)} className="page-link">
                                            {i + 1}
                                        </Button>
                                    </div>
                                ))}
                                <div className="page-item">
                                    <Button variant="link" onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(products.length / itemsPerPage)} className="page-link">
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
}
