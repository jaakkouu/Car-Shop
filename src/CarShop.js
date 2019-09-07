import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

const CarShop = () => {

    const [cars, setCars] = useState([]);

    useEffect(() => {
        fetch('https://carstockrest.herokuapp.com/cars')
        .then(response => response.json())
        .then((data) => setCars(data._embedded.cars))
    }, [])

    const removeRow = (index) => {

    }

    const editRow = (index) => {
        console.log(index);
    }

    const columns = [
        {
            Header: 'Brand',
            accessor: 'brand'
        }, {
            Header: 'Model',
            accessor: 'model'
        }, {
            Header: 'Color',
            accessor: 'color'
        }, {
            Header: 'Fuel',
            accessor: 'fuel'
        }, {
            Header: 'Year',
            accessor: 'year'
        }, {
            Header: 'Price',
            accessor: 'price'
        }, {
            Header: 'Actions',
            Cell: row => (
                <div>
                    <button onClick={() => editRow(row)}>Edit</button>
                    <button onClick={() => removeRow(row.index)}>Delete</button>
                </div>
             )
        }
    ]

    return (
        <div>
            <header>
                <h1>Car Shop Management Tool</h1>
                <span>Add New Car</span>
            </header>
            <main>
                <ReactTable data={cars} columns={columns} pageSize='10' />
            </main>
            <footer>
                Export CSV
            </footer>
        </div>
    )
}

export default CarShop; 

