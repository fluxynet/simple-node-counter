const app     = require('express')();
const simple  = process.argv.indexOf('--simple') !== -1;
const port    = (() => {
    let pi = process.argv.indexOf('--port');
    return process.argv.length > pi+1
        && parseInt(process.argv[pi+1]) ? parseInt(process.argv[pi+1]) : 1234;
})();
const counter = simple ? (function() {
    let me   = this;
    me.data  = [];

    return {
        incr : (key) => {
            if (!me.data.hasOwnProperty(key)) {
                me.data[key] = 0;
            }
            return ++(me.data[key]);
        }
    };
})() : require('redis').createClient();

app.get('/*', function (req, res) {
  res.json({
      all : counter.incr('#counter:all'),
      path: counter.incr(req.path)
  })
});

app.listen(port, function () {
  console.log(`Counter listening on port ${port} with counter [${simple ? 'Simple' : 'Redis'}]`);
});
