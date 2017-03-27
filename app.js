const app     = require('express')();
const simple  = process.argv.indexOf('--simple') !== -1;
const port    = (() => {
    let pi = process.argv.indexOf('--port');
    return process.argv.length > pi+1 && parseInt(process.argv[pi+1])
        ? parseInt(process.argv[pi+1]) : 1234;
})();

const inApp = () => {
    let me   = this;
    me.data  = [];

    return {
        incr : key => {
            return new Promise(resolve => {
                if (!me.data.hasOwnProperty(key)) {
                    me.data[key] = 0;
                }
                resolve(++(me.data[key]));
            });
        }
    };
};

const inRedis = () => {
    let client = require('redis').createClient();
    return {
        incr : key => {
            return new Promise(resolve => {
                client.incr(key, (err, result) => {
                    resolve(err ? -1 : result);
                });
            });
        }
    };
};

const counter = simple ? inApp() : inRedis();

app.get('/*', function (req, res) {
    let pAll  = counter.incr('#counter:all');
    let pPath = counter.incr(req.path);
    Promise.all([pAll, pPath]).then(counts => {
        res.json({
            all : counts[0],
            path: counts[1]
        });
    });
});

app.listen(port, function () {
  console.log(`Counter listening on port ${port} with counter [${simple ? 'Simple' : 'Redis'}]`);
});
