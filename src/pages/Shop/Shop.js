import React from 'react';
import className from 'classnames/bind';
import styles from './Shop.module.scss';
import axios from 'axios';
import { useState, useEffect } from 'react';
import ProductItem from '~/layouts/components/ProductItem/ProductItem';
import Image from '~/components/Image';
import ReactPaginate from 'react-paginate';
import Cookies from 'js-cookie';
import { Link, useLocation } from 'react-router-dom';
import images from '~/assets/images/images';

const cx = className.bind(styles);

function Shop() {
    const [productList, setProductList] = useState([]);
    const [pageCount, setPageCount] = useState();
    const [categories, setCategories] = useState([]);
    const postsPerPage = 8;

    const location = useLocation();
    const [urlParams, setUrlParams] = useState(new URLSearchParams(location.search));

    useEffect(() => {
        setUrlParams(new URLSearchParams(location.search));
    }, [location]);

    const query_String = window.location.search;
    const urlParam = new URLSearchParams(query_String);
    const category = urlParam.get('_cate');
    useEffect(() => {
        const token = Cookies.get('token');
        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        api.get(`${process.env.REACT_APP_BASE_URL}/shop?_page=1&_limit=${postsPerPage}&_cate=${category}`)
            .then((res) => {
                setProductList(res.data.products);
                setPageCount(res.data.count_product);
            })
            .catch((error) => {});
    }, [urlParams, category]);

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BASE_URL}/category`)
            .then((res) => {
                setCategories(res.data.categories);
            })
            .catch((error) => {});
    }, []);

    const getProducts = (currenPage) => {
        const token = Cookies.get('token');
        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        api.get(`${process.env.REACT_APP_BASE_URL}/shop?_page=${currenPage}&_limit=${postsPerPage}&_cate=${category}`)
            .then((res) => {
                setProductList(res.data.products);
                setPageCount(res.data.count_product);
            })
            .catch((error) => {});
    };

    const handlePageClick = (event) => {
        let currenPage = event.selected + 1;
        getProducts(currenPage);
    };

    return (
        <div className={cx('container_m')}>
            <div className={cx('row')}>
                <div className={cx('page-shop')}>
                    <div className={cx('sidebar', 'container_m')}>
                        <div className={cx('categories-shop')}>
                            <h5 className={cx('title-category')}>Category</h5>
                            <ul className={cx('title-product-list')}>
                                {categories.map((result) => (
                                    <li key={result._id} className={cx('title-product-item')}>
                                        <div className={cx('product-item')}>
                                            <Image className={cx('')} src={result.img} alt={''} />
                                            <Link
                                                className={cx('render-by-category')}
                                                to={`/shop?_cate=${result.category}`}
                                                
                                            >
                                                {result.title}
                                            </Link>
                                        </div>
                                        <div className={cx('count-product')}>{result.count}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className={cx("banner-img-sidebar")}>
                            <img src={images.banner11} alt="" />
                            <div className={cx("title-banner-sidebar")}>
                                <p>Oganic</p>
                                <h4>
                                    Sale 17% on <span>Organic</span> Juice
                                </h4>
                            </div>
                        </div>
                    </div>
                    <div className={cx('content-page', 'container_m')}>
                        <div className={cx('row')}>
                            {productList.map((result) => (
                                <ProductItem key={result._id} listProduct={result} flexCol={'col-3'} />
                            ))}
                        </div>
                        <div className={styles['pagination-container']}>
                            <ReactPaginate
                                onPageChange={handlePageClick}
                                previousLabel={'<'}
                                breakLabel={'...'}
                                nextLabel={'>'}
                                pageCount={pageCount}
                                marginPagesDisplayed={3}
                                pageRangeDisplayed={3}
                                containerClassName={'paginationn'}
                                pageClassName={'page-itemm'}
                                pageLinkClassName={'page-linkk'}
                                previousClassName={'page-itemm'}
                                previousLinkClassName={'page-linkk'}
                                nextClassName={'page-itemm'}
                                nextLinkClassName={'page-linkk'}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Shop;
