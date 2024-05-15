import React from 'react';

class ProductImage extends React.Component {

    render() {
        const {source, alt} = this.props;
        const backendUrl = 'http://localhost:5000'; // Backend URL
        const src = `${backendUrl}${source}`
        return (
            <img
                src={src} // Append backend URL to image source
                alt={alt}
                {...this.props} // Pass additional props
            />
        );
    }
}

export default ProductImage;
