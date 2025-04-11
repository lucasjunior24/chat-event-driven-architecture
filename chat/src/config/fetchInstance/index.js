import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:9000'
});

const fetch = {
  get: instance.get,
  post: instance.post
}

export default fetch;