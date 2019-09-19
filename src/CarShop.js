import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import {CSVLink} from 'react-csv';
import 'react-table/react-table.css';

const CarShop = () => {

    const [reactTable, setReactTable] = useState(React.createRef());
    const [filterable, setFilterable] = useState(false);
    const [data, setData] = useState({});
    const [csv, setCSV] = useState([]);
    const [csvLink, setCSVLink] = useState(null);
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

    const sliderColumnFilter = props => {
        let min = Math.min.apply(Math, data.cars.map(function(o) { return o[props.column.id]; })),
            max = Math.max.apply(Math, data.cars.map(function(o) { return o[props.column.id]; }));
        return <div>
            <span style={{textAlign: 'center'}}>{props.filter !== undefined ? props.filter.value : min}</span>
            <div>
                <input type="range" defaultValue={min} onChange={(e) => props.onChange(e.target.value)} min={min} max={max} />
            </div>
        </div>
    }

    const selectColumnFilter = props => {
        const options = data.cars.filter((car, i) => {
            return i === data.cars.findIndex(obj => {
                return car[props.column.id] === obj[props.column.id];
            })
        });
        return <select onChange={(e) => props.onChange(e.target.value)}>
            <option value="">All</option>
            {options.map((option, i) => <option key={i} value={option[props.column.id]}>{option[props.column.id]}</option>)}
        </select>
    }

    const greaterOrEqual = (filter, row) => {
        const rowValue = row[filter.id];
        if(!rowValue) {
            return;
        }
        const filterValue = filter.value || "";
        return rowValue >= filterValue;
    }

    const columns = [
        {
            Header: 'Brand',
            accessor: 'brand',
            Cell: props => editableCell(props),
            Filter: selectColumnFilter
        }, {
            Header: 'Model',
            accessor: 'model',
            Cell: props => editableCell(props),
            Filter: selectColumnFilter
        }, {
            Header: 'Color',
            accessor: 'color',
            Cell: props => editableCell(props),
            Filter: selectColumnFilter
        }, {
            Header: 'Fuel',
            accessor: 'fuel',
            Cell: props => editableCell(props),
            Filter: selectColumnFilter
        }, {
            Header: 'Year',
            accessor: 'year',
            Cell: props => editableCell(props),
            Filter: sliderColumnFilter,
            filterMethod: (filter, row) => greaterOrEqual(filter, row)

        }, {
            Header: 'Price',
            accessor: 'price',
            Cell: props => editableCell(props),
            Filter: sliderColumnFilter,
            filterMethod: (filter, row) => greaterOrEqual(filter, row)
        }, {
            Header: <div><button className="btn filter" onClick={() => setFilterable(!filterable)}>{filterable ? 'Unfilter' : 'Filter'}</button></div>,
            filterable: false,
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
        let newCars = data.cars,
            isNew = row.original.hasOwnProperty('_links') ? false : true;
        if(isNew){
            newCars.splice(row.index, 1);
            setData({
                cars: newCars,
                count: newCars.count--
            });
            return;
        }
        setLoading(true);
        fetch(row.original._links.self.href, {
            method: 'DELETE'
        })
        .then(() => {
            newCars.splice(row.index, 1);
            setData({
                cars: newCars,
                count: newCars.count--
            });
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
            'brand': '',
            'model': '',
            'color': '',
            'fuel': '',
            'price': '',
            'year': ''
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
        const data = [];
        reactTable.getResolvedState().sortedData.forEach((obj) => {
            let newObj = {};
            for(let i = 0; i < columns.length; i++){
                if(columns[i].Header.constructor !== Object) {
                    newObj[columns[i].Header] = obj[columns[i].accessor];
                }
            }
            data.push(newObj);
        });
        setCSV(data);
        csvLink.link.click();
    }

    return (<div>
            <header>
                <h1>Car Shop Management Tool</h1>
                <div>
                    <button className="btn primary" onClick={add}>Create New Car</button>
                </div>
            </header>
            <main>
                <ReactTable
                    ref={(r) => setReactTable(r)}
                    data={data.cars} 
                    columns={columns} 
                    filterable={filterable}
                    pages={pages}
                    loading={loading}
                    defaultPageSize={pageSize}
                    className="-striped -highlight"
                />
            </main>
            <footer>
                <button className="btn primary" onClick={exportCSV}>Export CSV</button>
                <CSVLink
                    data={csv}
                    filename="data.csv"
                    className="hidden"
                    ref={(r) => setCSVLink(r)}
                    target="_blank"
                />
            </footer>
        </div>)
}

export default CarShop;