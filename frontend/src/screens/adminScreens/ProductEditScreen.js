import React, {useContext, useEffect, useReducer, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import {Store} from '../../Store';
import {getError} from '../utils';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import {Helmet} from 'react-helmet-async';
import LoadingBox from '../../components/LoadingBox';
import MessageBox from '../../components/MessageBox';
import Button from 'react-bootstrap/Button';
import {toast} from 'react-toastify';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return {...state, loading: true};
        case 'FETCH_SUCCESS':
            return {...state, loading: false};
        case 'FETCH_FAIL':
            return {...state, loading: false, error: action.payload};
        case 'UPDATE_REQUEST':
            return {...state, loadingUpdate: true};
        case 'UPDATE_SUCCESS':
            return {...state, loadingUpdate: false};
        case 'UPDATE_FAIL':
            return {...state, loadingUpdate: false};
        case 'UPLOAD_REQUEST':
            return {...state, loadingUpload: true, errorUpload: ''};
        case 'UPLOAD_SUCCESS':
            return {
                ...state,
                loadingUpload: false,
                errorUpload: '',
            };
        case 'UPLOAD_FAIL':
            return {...state, loadingUpload: false, errorUpload: action.payload};
        default:
            return state;
    }
};

export default function ProductEditScreen() {
    const navigate = useNavigate();
    const params = useParams(); // /:type/:id
    const {type, id} = params;

    const {state} = useContext(Store);
    const {userInfo} = state;

    const [{loading, error, loadingUpdate, loadingUpload}, dispatch] =
        useReducer(reducer, {
            loading: true,
            error: '',
        });
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');
    const [countInStock, setCountInStock] = useState('');
    const [description, setDescription] = useState('');
    const [size, setSize] = useState('');
    const [color, setColor] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({type: 'FETCH_REQUEST'});
                const {data} = await axios.get(`/api/${type}s/${id}`);
                setName(data.name);
                setSlug(data.slug);
                setPrice(data.price);
                setImage(data.image);
                setCountInStock(data.countInStock);
                setDescription(data.description);
                setSize(data.size || ''); // Set default value if size is undefined
                setColor(data.color || ''); // Set default value if color is undefined
                dispatch({type: 'FETCH_SUCCESS'});
            } catch (error) {
                dispatch({
                    type: 'FETCH_FAIL',
                    payload: getError(error),
                });
            }
        };
        fetchData();
    }, [type, id]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch({type: 'UPDATE_REQUEST'});
            await axios.put(
                `/api/${type}s/${id}`,
                {
                    _id: id,
                    name,
                    slug,
                    price,
                    image,
                    countInStock,
                    description,
                    size,
                    color,
                },
                {
                    headers: {Authorization: `Bearer ${userInfo.token}`},
                }
            );
            dispatch({
                type: 'UPDATE_SUCCESS',
            });
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`);
            navigate('/admin/products');
        } catch (err) {
            toast.error(getError(err));
            dispatch({type: 'UPDATE_FAIL'});
        }
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const bodyFormData = new FormData();
        bodyFormData.append('file', file);
        bodyFormData.append('type', type); // Add request type
        bodyFormData.append('id', id); // Add product id
        try {
            dispatch({type: 'UPLOAD_REQUEST'});
            const {data} = await axios.post('/api/upload', bodyFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    authorization: `Bearer ${userInfo.token}`,
                },
            });
            dispatch({type: 'UPLOAD_SUCCESS'});
            setImage(data);
            toast.success('Image uploaded successfully. click Update to apply it');
        } catch (err) {
            toast.error(getError(err));
            dispatch({type: 'UPLOAD_FAIL', payload: getError(err)});
        }
    };

    return (
        <Container className="small-container">
            <Helmet>
                <title>Edit {id}</title>
            </Helmet>
            <h1>Edit {type.charAt(0).toUpperCase() + type.slice(1)} {id}</h1>

            {loading ? (
                <LoadingBox></LoadingBox>
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <Form onSubmit={submitHandler}>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="slug">
                        <Form.Label>Slug</Form.Label>
                        <Form.Control
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="price">
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="image">
                        <Form.Label>Image URL</Form.Label>
                        <Form.Control
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="imageFile">
                        <Form.Label>Upload Image</Form.Label>
                        <Form.Control type="file" onChange={uploadFileHandler}/>
                        {loadingUpload && <LoadingBox></LoadingBox>}
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="countInStock">
                        <Form.Label>Count In Stock</Form.Label>
                        <Form.Control
                            type="number"
                            value={countInStock}
                            onChange={(e) => setCountInStock(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </Form.Group>
                    {/* Add Size Field */}
                    {type === 'flower' && <Form.Group className="mb-3" controlId="size">
                        <Form.Label>Size</Form.Label>
                        <Form.Control
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            required
                        />
                    </Form.Group>}
                    {type === 'flower' && <Form.Group className="mb-3" controlId="color">
                        <Form.Label>Color</Form.Label>
                        <Form.Control
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            required
                        />
                    </Form.Group>}
                    <div className="mb-3">
                        <Button
                            disabled={loadingUpdate}
                            variant="outline-primary"
                            type="submit"
                        >
                            Save
                        </Button>
                        {loadingUpdate && <LoadingBox></LoadingBox>}
                    </div>
                </Form>
            )}
        </Container>
    );
}

