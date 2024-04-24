import React, { useEffect, useReducer } from 'react';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Flower from '../components/Flower';
import Container from "react-bootstrap/Container";


const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, flowers: action.payload, loading: false };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

export default function BouquetsScreen() {
    const [{ loading, error, flowers }, dispatch] = useReducer(reducer, {
        flowers: [],
        loading: true,
        error: '',
    });
    //const [flowers, setFlowers] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            dispatch({ type: 'FETCH_REQUEST' });
            try {
                const result = await axios.get('/api/flowers');
                dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
            } catch (error) {
                dispatch({ type: 'FETCH_FAIL', payload: error.message });
            }
            //setFlowers(result.data);
        };
        fetchData();
    }, []);
    return (

        <div >
            <img
                src="/main.jpg"
                className="Flowers"
                alt=""
            />
            <Container>
                <Helmet>
                    <title> Flower Boutique</title>
                </Helmet>
                <div className="flowers">
                    <h1>Flowers</h1>
                    {loading ? (
                        <LoadingBox/>
                    ) : error ? (
                        <MessageBox variant="danger">{error}</MessageBox>
                    ) : (

                        <Row>
                            {flowers.map((flower) => (
                                <Col key={flower.slug} sm={6} md={4} lg={3} className="mb-3">
                                    {/* <Flower flower={flower}></Flower> */}
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
