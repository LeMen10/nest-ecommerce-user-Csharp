import React, { Fragment } from 'react';
import axios from 'axios';
import className from 'classnames/bind';
import styles from './Search.module.scss';
import ProductItem from '~/layouts/components/ProductItem/ProductItem';
import ReactPaginate from 'react-paginate';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const cx = className.bind(styles);

function Search() {
    const query_String = window.location.search;
    const urlParam = new URLSearchParams(query_String);
    const query = urlParam.get('_query');
    const [productList, setProductList] = useState([]);
    const [pageCount, setPageCount] = useState();
    const postsPerPage = 10;

    const location = useLocation();
    const [urlParams, setUrlParams] = useState(new URLSearchParams(location.search));

    useEffect(() => {
        setUrlParams(new URLSearchParams(location.search));
    }, [location]);

    useEffect(() => {
        const token = Cookies.get('token');
        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        api.post(`${process.env.REACT_APP_BASE_URL}/search?_query=${query}&_page=${1}&_limit=${postsPerPage}`)
            .then((res) => {
                setProductList(res.data.products);
                setPageCount(res.data.count_product);
            })
            .catch((error) => {});
    }, [query, urlParams]);

    const getProducts = (currenPage) => {
        const token = Cookies.get('token');
        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        api.post(`${process.env.REACT_APP_BASE_URL}/search?_query=${query}&_page=${currenPage}&_limit=${postsPerPage}`)
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
            <div className={cx('title-page')}>
                <h3>Tìm kiếm</h3>
            </div>
            <div className={cx('result-title')}>
                <p>
                    Kết quả tìm kiếm cho "<span>{query}</span>".
                </p>
            </div>
            <div className={cx('row')}>
                <div className={cx('page-shop')}>
                    {productList.length > 0 ? (
                        <Fragment>
                            <div className={cx('content-page', 'container_m')}>
                                <div className={cx('row')}>
                                    {productList.map((result) => (
                                        <ProductItem key={result._id} listProduct={result} flexCol={'col-2-4'} />
                                    ))}
                                </div>
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
                        </Fragment>
                    ) : (
                        <Fragment>
                            <p className={cx('no-result')}>Không có sản phẩm mà bạn cần tìm.</p>
                        </Fragment>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Search;
