import '../App.css';
import {Table, Container, Row, Button, ButtonGroup, Form, Col, Jumbotron } from 'react-bootstrap';
import React, { Component, useState } from 'react';
import { BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';
import Preloader from './Preloader';
import PencilIcon from './PencilIcon';
import update from 'react-addons-update';

class  Albums extends Component {

  constructor(props) { 
    super(props);   
    this.album= "";
    this.artist=0;
    this.searching="";
    this.state = {
      getAlbums: []
    }
  }

    getAlbums = async() => {
        const response = await fetch('/api/albums');
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    }

    componentDidMount() {
        this.getAlbums()
          .then(res => {          
            this.setState({ getAlbums: res });          
          });      
    }

    //delete album by id
    deleteItem = async (item) => {

        const settings = {
          method: 'DELETE'
        };
        try {
          const fetchResponse = await fetch(`http://localhost:8080/api/albums/${item}`, settings);
          const data = await fetchResponse.json();
          alert('item deleted');
          //window.location.reload();
          return data;
        } catch (e) {
          alert('error');
          return e;
        }    
  
    }

    //PUT: title and album id
    handleInputChange(event, id){
        const val = event.target.value;
        //set value for editItem, new state
        const newState = Object.assign({}, this.state);
        newState.getAlbums[id-1].Title = val;
    }
    handleInputArtistChange(event, id){
      let val = event.target.value;
      //set value for editItem, new state
      const newState = Object.assign({}, this.state);
      newState.getAlbums[id-1].ArtistId = val;
    }
  
    //search by id or name
    handleSearchChange(event){
        let val = event.target.value;
        this.searching = val;
    }

    //search item
    handleSearch = async (event) => {
        event.preventDefault();
        const val = this.searching;
        const response = await fetch(`/api/albums/search/${val}`);
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
  
        let message;
        if (body.error) {
          message = body.error
        }
        else{
          let data = body[0].Title;
          let id = body[0].AlbumId;
          let artistid = body[0].ArtistId;
          message = `id: ${id} ${data} <br> artist id: ${artistid}`;
        }
        
        //show results
        document.getElementById("results").classList.remove("hide");
        document.getElementById("results").classList.add("show");
        document.getElementById("results").innerHTML = message;
        
        return body;
    }

    //edit item
    async editItem(id, alb, artid) {
        //no modifications are added
        const val_album = (this.album==='') ? alb : this.album;
        const val_art_id = (this.artist===0) ? artid : this.artist;
  
        const settings = {
          method: 'PUT',
          headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({title: val_album, artistid: val_art_id})
        };
        try {
          const fetchResponse = await fetch(`http://localhost:8080/api/albums/${id}`, settings);
          const data = await fetchResponse.json();
          alert('item saved');
          return data;
        } catch (e) {
          alert('error');
          return e;
        }    
  
    }

    render() {
        const { getAlbums } = this.state;

        //get all albums (home)
        const Home = () => (
          <Row>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Artist</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
              { getAlbums.map(album => 
                <tr key={album.AlbumId}>
                  <td className="align-middle">{album.AlbumId}</td>
                  <td>
                    <input
                    type="text"
                    className="form-control"
                    id={`album_${album.AlbumId}`}
                    defaultValue={getAlbums[album.AlbumId-1].Title}
                    onBlur={(event) => this.handleInputChange(event, album.AlbumId)}
                    />
                  </td>
                  <td>
                    <input
                        type="number"
                        className="form-control col-sm-4 artist-td"
                        id={`artist_${album.AlbumId}`}
                        defaultValue={getAlbums[`${album.AlbumId-1}`].ArtistId}
                        onChange={(event) => this.handleInputArtistChange(event, album.AlbumId)}
                        min="1" max="10000"
                    />
                  </td>
                  <td className="align-middle">
                    <ButtonGroup>
                      <Button className="btn btn-secondary btn-sm" role="button" onClick={() => this.editItem(album.AlbumId, album.Title, album.ArtistId)}> <PencilIcon /> </Button>
                      {/* to="/playlist/add" */}
                      <Button className="btn btn-secondary btn-sm" role="button" onClick={() => this.deleteItem(album.AlbumId)}>X</Button> 
                      {/* to="/playlist/search" */}
                    </ButtonGroup>
                  </td>
                  
                </tr>)
              }
              </tbody>
            </Table>
            {/* preloader */}
            { getAlbums.length<1?<Preloader />:''}
          </Row>
        );
        
        //search component
        const SearchAlbum = () => {

          return (
            <Container className="mt-5">
              <Row className="justify-content-md-center">
                <Col xs lg="6">
                  <Jumbotron>
                  {/* onSubmit={handleSearch} */}
                    <Form onSubmit={(event) => this.handleSearch(event)}>
                      <Form.Group>
                        <Form.Label>Search by id or by name</Form.Label>
                        <Form.Control 
                            type="text"
                            placeholder="Album title"
                            required
                            onChange={(event) => this.handleSearchChange(event)}
                         /> 
                      </Form.Group>
                      <Button variant="primary" type="submit" >
                        Search
                      </Button>
                    </Form>

                    {/* search results */}
                    <div className="mt-5 hide" id="results">
                    </div>

                  </Jumbotron>
                </Col>  
              </Row>
            </Container>
          );
          
        };

        //add new album
        const AddAlbum = () => {

          function AlbumListForm() {

            //state using hook
            const [albumTitle,setAlbumTitle] = useState();
            const [artistid, setArtistId] = useState();
          
            const handleSubmit = (event) => {          
              event.preventDefault();
              event.stopPropagation();
              console.log('title',albumTitle, 'artist id', artistid);
              saveAlbumlist(albumTitle, artistid);
            };

            const handleAlbumChange = (event) => {
              setAlbumTitle(event.target.value);
            };

            const handleArtistChange = (event) => {
                setArtistId(event.target.value);
              };

            const saveAlbumlist = async (albumtitle, artistid) => {
              const settings = {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({title: albumtitle, artistid: artistid})
              };
              try {
                const fetchResponse = await fetch(`http://localhost:8080/api/albums`, settings);
                const data = await fetchResponse.json();
                alert('new item added');
                return data;
              } catch (e) {
                alert('error');
                return e;
              }    

            }
          
            return(
            <Container className="mt-5">
            <Row className="justify-content-md-center">
              <Col xs lg="6">
                <Jumbotron>
                  <Form onSubmit={handleSubmit} >
                    <Form.Group>
                      <Form.Label>Add a new album</Form.Label>
                      <Form.Control onChange={handleAlbumChange} type="text" placeholder="Album title" required/>
                      <Form.Control onChange={handleArtistChange} type="number" placeholder="Artist id" required/>
                    </Form.Group>
                    <Button variant="primary" type="submit" >
                      Submit
                    </Button>
                  </Form>
                </Jumbotron>
              </Col>
            </Row>
          </Container>
            )
          }
          return(<AlbumListForm />);

        };

        return(
            <div>
              <Router>          
                  <Container>
                    <h3>
                      Albums ({getAlbums.length})
                      <ButtonGroup className="ml-2">
                        <Link className="btn btn-secondary btn-sm" role="button" to="/album/add">add</Link>
                        <Link className="btn btn-secondary btn-sm" role="button" to="/album/search">search</Link>
                        {/* the component should update */}
                        <Link className="btn btn-secondary btn-sm" role="button" to="/albums">list</Link>
                      </ButtonGroup>
                    </h3>  
                    <Switch>
                      <Route path="/albums" exact component={Home} />
                      <Route path="/album/add" component={AddAlbum} />
                      <Route path="/album/search" component={SearchAlbum} />
                    </Switch>
                  </Container>         
              </Router>
            </div>
         );
        }
}

export default Albums;