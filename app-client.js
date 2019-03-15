/* eslint-disable camelcase,new-cap,react/jsx-no-bind,no-undef */
import React, { Component } from 'react';
import { render } from 'react-dom';
import io from 'socket.io-client';
import S from 'shorti';
import _ from 'lodash';
import { Input, Button } from 'react-bootstrap';

class App extends Component {

  constructor(props) {
    super(props);
    const socket = io('http://localhost:3000');
    this.state = {
      data: {
        messages: [],
      },
      socket,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.refs.author.refs.input.focus();
    }, 100);
    // Listen for messages coming in
    this.state.socket.on('chat message', message => {
      if (this.state.data.author) {
        const messages = this.state.data.messages;
        messages.push(message);
        this.setState({
          data: {
            author: this.state.data.author,
            messages,
          },
        });
      }
    });
    this.state.socket.on('test', d => console.log(d));
    this.state.socket.on('receive messages', messages => this.setState({
      data: {
        author: this.state.data.author,
        messages,
      },
    }));
  }

  componentDidUpdate() {
    if (this.refs.message) {
      this.refs.message.refs.input.focus();
    }
    if (this.refs.messages_scroll_area) {
      this.refs.messages_scroll_area.scrollTop = this.refs.messages_scroll_area.scrollHeight;
    }
  }

  setAuthor = () => {
    const author = this.refs.author.refs.input.value.trim();
    if (!author) return;
    this.refs.author.refs.input.value = '';
    const messages = this.state.data.messages;
    this.setState({
      data: {
        author,
        messages,
      },
    });
    this.state.socket.emit('request messages', new Date('2008'));
  }

  createMessage = () => {
    const data = this.state.data;
    const message_text = this.refs.message.refs.input.value.trim();
    if (!message_text) return;
    const message_emit = {
      message: message_text,
      author: data.author,
    };
    // Send message out
    this.state.socket.emit('chat message', message_emit);
    this.refs.message.refs.input.value = '';
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const data = this.state.data;
    if (data.author) {
      this.createMessage();
    } else {
      this.setAuthor();
    }
  };

  render() {
    const { data } = this.state;
    let form_input;
    if (!data.author) {
      form_input = (
        <div>
          Hi, what is your name?<br />
          <Input type="text" ref="author" />
        </div>
      );
    } else {
      form_input = (
        <div>
          Hello { data.author }, type a message:<br />
          <Input type="text" ref="message" />
        </div>
      );
    }
    const messages = data.messages;
    let messages_list;
    if (messages) {
      // order by created
      const sorted_messages = _.sortBy(messages, message => {
        return message.createdAt;
      });
      messages_list = sorted_messages.map(message_object => {
        if (message_object) {
          return (
            <li style={{
              listStyle: 'none',
              ...S('mb-5'),
              display: 'flex',
              flexDirection: 'row',
            }} key={ message_object._id }
            >
              {message_object.author === this.state.data.author &&
                <Button onClick={(e) => {
                  e.preventDefault();
                  this.state.socket.emit('remove chat', message_object._id);
                }}
                >-</Button>
              }
              <div style={{ marginLeft: '10px' }}>
                <b>{ message_object.author }</b><br/>
                { message_object.message }
              </div>
            </li>
          );
        }
      });
    }
    const scroll_area_style = {
      ...S('h-' + (window.innerHeight - 140)),
      overflowY: 'scroll',
    };
    return (
      <div>
        <div style={ S('pl-15') }>
          <h2>Chat Box!</h2>
          <div ref="messages_scroll_area" style={ scroll_area_style }>
            <ul style={ S('p-0') }>{ messages_list }</ul>
          </div>
        </div>
        <div style={ S('absolute b-0 w-100p pl-15 pr-15') }>
          <form onSubmit={ this.handleSubmit }>
            { form_input }
          </form>
        </div>
      </div>
    );
  }
}
const app = document.getElementById('app');
render(<App />, app);
