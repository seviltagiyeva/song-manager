/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
import React from 'react';
import fetch from 'isomorphic-fetch';
import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import './App.sass';

class App extends React.Component {
  state = {
    songs: [],
  };

  componentDidMount() {
    const { match } = this.props;
    const { id } = match.params;
    const url = id ? `http://192.168.64.2/songs-api/api/songs/${id}` : 'http://192.168.64.2/songs-api/api/songs';
    fetch(url)
      .then(response => response.json())
      .then((result) => {
        const data = id ? [result] : result;
        this.setState({ songs: data });
      });
  }

  onRowAdd = newData => (
    fetch('http://192.168.64.2/songs-api/api/songs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    })
      .then(response => response.json())
      .then((result) => {
        this.setState({ songs: result });
      })
  )

  onRowDelete = (oldData) => {
    const { songs } = this.state;
    const newSongs = songs.filter(song => +song.id !== +oldData.id);
    return fetch(`http://192.168.64.2/songs-api/api/songs/${oldData.id}/`, {
      method: 'Delete',
    })
      .then(() => {
        this.setState({ songs: newSongs });
      });
  }

  onRowUpdate = (newData, oldData) => {
    const { songs } = this.state;
    return fetch(`http://192.168.64.2/songs-api/api/songs/${oldData.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    })
      .then(response => response.json())
      .then((result) => {
        const editedSongs = [...songs.filter(song => +song.id !== +result.id), newData];
        this.setState({ songs: editedSongs });
      });
  }

  render() {
    const { songs } = this.state;
    const { history } = this.props;
    const { match } = this.props;
    const { id } = match.params;
    const headers = [
      {
        title: 'Artist',
        field: 'artist',
        render: rowData => (
          <span
            role="button"
            className={!id ? 'link' : ''}
            onClick={() => (
              !id && history.push(`/${rowData.id}`)
            )}
          >
            {rowData.artist}
          </span>
        ),
      },
      { title: 'Album', field: 'album' },
      { title: 'Title', field: 'title' },
      {
        title: 'Play',
        field: 'hook_url',
        render: rowData => (
          <audio controls>
            <track kind="captions" />
            <source src={rowData.hook_url} type="audio/mpeg" />
            <source src={rowData.hook_url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        ),
      },
    ];

    return (
      <div>
        <MaterialTable
          title="Song Manager"
          columns={headers}
          data={songs}
          options={id && { toolbar: false }}
          editable={{
            onRowAdd: this.onRowAdd,
            onRowUpdate: (newData, oldData) => this.onRowUpdate(newData, oldData),
            onRowDelete: this.onRowDelete,
          }}
        />
      </div>
    );
  }
}

App.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default App;
