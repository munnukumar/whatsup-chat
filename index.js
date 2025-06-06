import whatRoute from "./routes/what.route.js";
import express from "express";

const app = express();

app.use(express.json());

app.use("/api", whatRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});