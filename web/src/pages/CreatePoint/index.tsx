import React,{useEffect, useState, ChangeEvent, FormEvent} from 'react'
import './styles.css'
import {Link, useHistory} from 'react-router-dom'
import {FiArrowLeft} from 'react-icons/fi'
import {Map,TileLayer, Marker} from 'react-leaflet'
import {LeafletMouseEvent} from 'leaflet'
import axios from 'axios'

import logo from '../../assets/logo.svg'

import api from '../../services/api'


interface IBGEUFResponse{
    sigla: string
}

interface IBGECityResponse{
    nome: string
}

const CreatePoint = ()=>{

    const [items,setItems] = useState([]);
    const [ufs, setUfs] = useState<String[]>([]);
    const [cities,setCities] = useState([])
    const [selectedUf, setSelectedUf] = useState("0");
    const [selectedCity, setSelectedCity] = useState("0");
    const [selectedPosition, setSelectedPosition] = useState<number, number>([0,0])
    const [initialPosition, setInitialPosition] = useState<number, number>([0,0])
    const [selectedItems, setSelectedItems] = useState<number>([])
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })

    const history = useHistory()

    useEffect(()=>{
        api.get('/items').then(response =>{
            setItems(response.data);
        })
    },[])

    useEffect(()=>{
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
        .then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);
            setUfs(ufInitials)
        })
    }, [])

    useEffect(() =>{
        navigator.geolocation.getCurrentPosition(position =>{
            const {latitude, longitude} = position.coords;
            console.log(latitude, longitude)
            setInitialPosition([latitude, longitude]);
        })
    })

    useEffect(() => {
        if(selectedUf != 0){
            axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => {
                const cityNames = response.data.map(city => city.nome)
                setCities(cityNames)
            })
        }
    },[selectedUf])

    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;
        
        setSelectedUf(uf);
    }

    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;
        
        setSelectedCity(city);
    }

    function handleMapClick(event : LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const {name, value} = event.target;
        setFormData({
            ...formData,
            [name]: value 
        })
    }

    function handleSelectItem(id : number){
        const alreadySelected = selectedItems.findIndex(item => item === id)
        if(alreadySelected >= 0 ){
            const filteredItem = selectedItems.filter(item => item !== id)
            setSelectedItems(filteredItem);
        }else{
            setSelectedItems([...selectedItems, id]);
        }   
    }

    async function handleSubmit(event: FormEvent){
        event.preventDefault();

        const [latitude, longitude] = selectedPosition;

        const data = {
            ...formData,
            uf: selectedUf,
            city: selectedCity,
            latitude,
            longitude,
            items:selectedItems
        }
        console.log(data)
        await api.post('points', data);

        alert('Ponto de coleta salvo')

        history.push('/')
    }

    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft/>
                    Voltar para a home
                </Link>
            </header>

            <form onSubmit={handleSubmit} action="">
                <h1>Cadastro do <br/>ponto de coleta</h1>
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da Entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}/>
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}/>
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">WhatsApp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}/>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o Endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                        <Marker position={selectedPosition}></Marker>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select value={selectedUf} onChange={handleSelectedUf} name="uf" id="uf">
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select value={selectedCity} onChange={handleSelectedCity} name="city" id="city">
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(citie => (
                                    <option key={citie} value={citie}>{citie}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coletas</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {
                            items.map(item => (
                                <li 
                                    key={item.id} 
                                    onClick={() => handleSelectItem(item.id)}
                                    className={selectedItems.includes(item.id) ? 'selected' : ''}>
                                    <img src={item.image_url} alt="Teste"/>
                                    <span>{item.name}</span>
                                </li>
                            ))
                        }
                    </ul>
                </fieldset>

                <button type="submit">Cadastrar Ponte de coleta</button>
            </form>
        </div>
    );
}

export default CreatePoint;