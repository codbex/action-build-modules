import { response } from 'sdk/http';

response.println('Hello World!');
response.flush();
response.close();
