import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

const CarShop = () => {

    const [cars, setCars] = useState([]);
    const [pages, setPages] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(null);
    const pageSize = 10;

    useEffect(() => fetchData(), [])

    const buttonCell = (row) => {
        if(editing !== null && editing.index === row.index){
            return (
                <div style={{"textAlign": "center"}}>
                    <button className="btn save" onClick={() => save()}>Save</button>
                    <button className="btn cancel" onClick={() => setEditing(null)}>Cancel</button>
                </div>
            )
        } else {
            return (
                <div style={{"textAlign": "center"}}>
                    <button className="btn edit" onClick={() => edit(row)}>Edit</button>
                    <button className="btn remove" onClick={() => remove(row)}>Delete</button>
                </div>
            )
        }
    }
     
    const columns = [
        {
            Header: 'Brand',
            accessor: 'brand',
            Cell: props => editableCell(props)
        }, {
            Header: 'Model',
            accessor: 'model',
            Cell: props => editableCell(props)
        }, {
            Header: 'Color',
            accessor: 'color',
            Cell: props => editableCell(props)
        }, {
            Header: 'Fuel',
            accessor: 'fuel',
            Cell: props => editableCell(props)
        }, {
            Header: 'Year',
            accessor: 'year',
            Cell: props => editableCell(props)
        }, {
            Header: 'Price',
            accessor: 'price',
            Cell: props => editableCell(props)
        }, {
            Header: '',
            Cell: buttonCell,
            sortable: false
        }
    ]

    const fetchData = () => {
        setLoading(true);
        fetch('https://carstockrest.herokuapp.com/cars')
        .then(response => response.json())
        .then((data) => {
            setLoading(false);
            setPages(Math.ceil(data._embedded.cars.length / pageSize));
            setCars(data._embedded.cars);
        })
    }
    
    const edit = row => {
        if(editing !== null && editing.index !== row.index){
            return;
        }
        setEditing(row);
    }

    const remove = row => {
        //cars.splice(cars[row.index], 1);
    }

    const save = () => {
        setEditing(null);
    }

    const add = () => {
        let car = {
            'brand': 'Type a brand',
            'model': 'Type a model',
            'color': 'Type a color',
            'fuel': 'Type a fuel',
            'price': 'Type a price',
            'year': 'Type a price'
        }
        cars.unshift(car);
        setCars(cars);
    }

    const editableCell = props => {
        return (editing !== null && editing.index === props.index) ? (<div
            onBlur={e => {
                let test = editing;
                test.original[props.column.id] = e.target.innerHTML;
                setEditing(test);
            }}
            contentEditable="true"
            suppressContentEditableWarning>
                {props.value}
        </div>) : props.value;
    }

    return (
        <div>
            <header>
                <h1>Car Shop Management Tool</h1>
                <span onClick={add}>Add New Car</span>
            </header>
            <main>
                <ReactTable
                    data={cars} 
                    columns={columns} 
                    pages={pages}
                    loading={loading}
                    defaultPageSize={pageSize}
                    className="-striped -highlight"
                />
            </main>
            <footer>
                Export CSV
            </footer>
        </div>
    )
}

export default CarShop; 

