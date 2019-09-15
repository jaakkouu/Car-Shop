import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import {CSVDownload} from 'react-csv';
import 'react-table/react-table.css';

const CarShop = () => {

    const [data, setData] = useState({});
    const [pages, setPages] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(null);
    const apiUrl = 'https://carstockrest.herokuapp.com';
    const pageSize = 10;

    useEffect(() => fetchData(), [])

    const buttonCell = (row) => {
        if(editing !== null && editing.index === row.index){
            if(editing.original.hasOwnProperty('_links')) {
                return (
                    <div style={{"textAlign": "center"}}>
                        <button className="btn save" onClick={save}>Save</button>
                        <button className="btn cancel" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                )
            } else {
                return (
                    <div style={{"textAlign": "center"}}>
                        <button className="btn add" onClick={save}>Add</button>
                        <button className="btn cancel" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                )
            }
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
        fetch(`${apiUrl}/cars`)
        .then(response => response.json())
        .then((data) => {
            setLoading(false);
            setPages(Math.ceil(data._embedded.cars.length / pageSize));
            setData({cars: data._embedded.cars, count: data._embedded.cars.length});
        })
    }
    
    const edit = row => {
        if(editing !== null && editing.index !== row.index){
            return;
        }
        setEditing(row);
    }

    const remove = row => {
        setLoading(true);
        fetch(row.original._links.self.href, {method: 'DELETE'})
        .then(() => {
            let newData = data;
            newData.cars.splice(row.index, 1);
            setData({
                cars: newData.cars,
                count:newData.count--
            })
            setLoading(false);
        });
    }

    const save = () => {
        setLoading(true);
        let isNew = editing.original.hasOwnProperty('_links') ? false : true;
        fetch(isNew ? `${apiUrl}/cars` : editing.original._links.self.href, {
            method: isNew ? 'POST' : 'PUT',
            body: JSON.stringify(editing.original),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(() => {
            setLoading(false);
            setEditing(null);
        });
    }

    const add = () => {
        let newCars = data.cars;
        newCars.unshift({
            'brand': 'Type a brand',
            'model': 'Type a model',
            'color': 'Type a color',
            'fuel': 'Type a fuel',
            'price': 'Type a price',
            'year': 'Type a year'
        });
        setData({cars: newCars, count: newCars.length});
    }

    const editableCell = props => {
        return (editing !== null && editing.index === props.index) ? (<div
            onBlur={e => {
                let row = editing;
                row.original[props.column.id] = e.target.innerHTML;
                setEditing(row);
            }}
            contentEditable="true"
            suppressContentEditableWarning>
                {props.value}
        </div>) : props.value;
    }

    const exportCSV = () => {

    }

    return (
        <div>
            <header>
                <h1>Car Shop Management Tool</h1>
                <div>
                    <button className="btn primary" onClick={add}>Create New Car</button>
                </div>
            </header>
            <main>
                <ReactTable
                    data={data.cars} 
                    columns={columns} 
                    pages={pages}
                    loading={loading}
                    defaultPageSize={pageSize}
                    className="-striped -highlight"
                />
            </main>
            <footer>
                <button className="btn primary" onClick={exportCSV}>Export CSV</button>
            </footer>
        </div>
    )
}

export default CarShop; 

