function isURL(url) {
  try {
    new URL(url);
    return true;
  } catch(error) {
    return false;
  }
}

module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", `max-age=0, s-maxage=${5 * 60}`);
  
  const { url } = req.query;
  console.log(`Checking ${url}`);

  if (!url) {
    res.statusCode = 400;
    res.end(JSON.stringify({error: "Missing URL argument"}, null, 2));
    return;
  }
  if (!isURL(url)) {
    res.statusCode = 400;
    res.end(JSON.stringify({error: "Invalid URL argument"}, null, 2));
    return;
  }

  const http = url.startsWith("https://") ? require("https") : require("http");
  const req2 = http.request(url, {method: "HEAD", timeout: 3000}, (res2) => {
    res.statusCode = 200;
    const reason = `HEAD request responded with ${res2.statusCode}`;
    res.end(JSON.stringify({isDown: false, url, reason}, null, 2));
  });
  req2.on("error", (e) => {
    res.statusCode = 200;
    const reason = `Error: ${e.message}`;
    res.end(JSON.stringify({isDown: true, url, reason}, null, 2));
  });
  req2.on("timeout", () => {
    res.statusCode = 200;
    const reason = `Timeout in 3 seconds`;
    res.end(JSON.stringify({isDown: true, url, reason}, null, 2));
  });
  req2.end();
};
