
#Create SSL Certificates

##For Linux or Mac OSX with openssl

```
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
```

This will create a "Self Signed" Certificate and allow you to test https on your local machine.


