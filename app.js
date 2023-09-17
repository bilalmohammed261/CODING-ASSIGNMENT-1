const { format, isValid } = require("date-fns");
const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dBPath = path.join(__dirname, "todoApplication.db");

let dBConnObj = null;
const connectDBAndStartServer = async () => {
  try {
    dBConnObj = await open({ filename: dBPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server is listening on http://localhost:3000/");
      //console.log(dBConnObj);
    });
  } catch (e) {
    console.log(`Error is :${e.message}`);
    process.exit(1);
  }
};

connectDBAndStartServer();

const snakeToCamelCase = (obj) => {
  return {
    id: obj.id,
    todo: obj.todo,
    priority: obj.priority,
    status: obj.status,
    category: obj.category,
    dueDate: obj.due_date,
  };
};

//API1

app.get("/todos/", async (request, response) => {
  //console.log(request.query);
  const { status, priority, search_q, category } = request.query;
  if (
    status !== undefined &&
    priority === undefined &&
    search_q === undefined &&
    category === undefined
  ) {
    if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      const query = `SELECT * FROM todo
  WHERE status = '${status}';`;
      console.log(query);
      //WHERE status = '${status}'
      const responseData = await dBConnObj.all(query);
      response.send(responseData.map((obj) => snakeToCamelCase(obj)));
    }
  } else if (
    priority !== undefined &&
    status === undefined &&
    search_q === undefined &&
    category === undefined
  ) {
    if (priority !== "HIGH" && priority !== "MEDIUM" && priority !== "LOW") {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else {
      const query = `SELECT * FROM todo
  WHERE priority = '${priority}';`;
      console.log(query);
      //WHERE status = '${status}'
      const responseData = await dBConnObj.all(query);
      response.send(responseData.map((obj) => snakeToCamelCase(obj)));
    }
  } else if (
    status !== undefined &&
    priority !== undefined &&
    search_q === undefined &&
    category === undefined
  ) {
    const query = `SELECT * FROM todo
  WHERE priority = '${priority}' AND status = '${status}';`;
    console.log(query);
    //WHERE status = '${status}'
    const responseData = await dBConnObj.all(query);
    response.send(responseData.map((obj) => snakeToCamelCase(obj)));
  } else if (
    search_q !== undefined &&
    category === undefined &&
    priority === undefined &&
    status === undefined
  ) {
    const query = `SELECT * FROM todo
  WHERE todo LIKE  '%${search_q}%';`;
    console.log(query);
    //WHERE status = '${status}'
    const responseData = await dBConnObj.all(query);
    response.send(responseData.map((obj) => snakeToCamelCase(obj)));
  } else if (
    search_q === undefined &&
    category !== undefined &&
    priority === undefined &&
    status === undefined
  ) {
    if (category !== "WORK" && category !== "LEARNING" && category !== "HOME") {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      const query = `SELECT * FROM todo
  WHERE category = '${category}';`;
      console.log(query);
      //WHERE status = '${status}'
      const responseData = await dBConnObj.all(query);
      response.send(responseData.map((obj) => snakeToCamelCase(obj)));
    }
  } else if (
    status !== undefined &&
    priority === undefined &&
    search_q === undefined &&
    category !== undefined
  ) {
    const query = `SELECT * FROM todo
  WHERE category = '${category}' AND status = '${status}';`;
    console.log(query);
    //WHERE status = '${status}'
    const responseData = await dBConnObj.all(query);
    response.send(responseData.map((obj) => snakeToCamelCase(obj)));
  } else if (
    status === undefined &&
    priority !== undefined &&
    search_q === undefined &&
    category !== undefined
  ) {
    const query = `SELECT * FROM todo
  WHERE category = '${category}' AND priority = '${priority}';`;
    console.log(query);
    //WHERE status = '${status}'
    const responseData = await dBConnObj.all(query);
    response.send(responseData.map((obj) => snakeToCamelCase(obj)));
  }
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  //console.log(request.params);

  const queryById = `SELECT * FROM todo
    WHERE id = '${todoId}';`;
  const dBResponse = await dBConnObj.get(queryById);
  response.send(snakeToCamelCase(dBResponse));
});

//API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  console.log(date);
  console.log(typeof date);
  let formattedDate = format(new Date(date), "yyyy-MM-dd");
  console.log(formattedDate);
  console.log(typeof formattedDate);
  if (!isValid(new Date(formattedDate))) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    const agendaQuery = `SELECT * FROM todo
    WHERE due_date = '${formattedDate}';`;
    const responseData = await dBConnObj.all(agendaQuery);
    response.send(responseData.map((obj) => snakeToCamelCase(obj)));
  }
});

//API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  //console.log(dueDate);

  //console.log(typeof(dueDate));
  //console.log(todo);

  //console.log(request.params);
   formattedDate = format(new Date(dueDate), "yyyy-MM-dd");
  console.log(formattedDate);

  if (category !== "WORK" && category !== "LEARNING" && category !== "HOME") {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (
    status !== "TO DO" &&
    status !== "IN PROGRESS" &&
    status !== "DONE"
  ) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (
    priority !== "HIGH" &&
    priority !== "MEDIUM" &&
    priority !== "LOW"
  ) {
    response.status(400);
    response.send("Invalid Todo Priority");

  }
  
  else if (!isValid(new Date(formattedDate))) {
    response.status(400);
    response.send("Invalid Due Date");
  } 
  else {
    const addTodoQuery = `INSERT INTO todo (id,todo,
      priority,status,category,due_date) VALUES (${id},'${todo}','${priority}',
      '${status}','${category}','${dueDate}')
    ;`;
    await dBConnObj.run(addTodoQuery);
    response.send("Todo Successfully Added");
  }
});

//API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo, category, dueDate } = request.body;
  if (
    todo === undefined &&
    priority === undefined &&
    status !== undefined &&
    category === undefined &&
    dueDate === undefined
  ) {
    if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      const updateQuery = `UPDATE  todo SET
      status = '${status}'
    WHERE id = '${todoId}';`;

      await dBConnObj.run(updateQuery);
      response.send("Status Updated");
    }
  } else if (
    todo === undefined &&
    priority !== undefined &&
    status === undefined &&
    category === undefined &&
    dueDate === undefined
  )
  {
    if (priority !== "HIGH" && priority !== "MEDIUM" && priority !== "LOW") {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else {
      const updateQuery = `UPDATE  todo SET
      priority = '${priority}'
    WHERE id = '${todoId}';`;

      await dBConnObj.run(updateQuery);
      response.send("Priority Updated");
    }
}
  else if (
    todo !== undefined &&
    priority === undefined &&
    status === undefined &&
    category === undefined &&
    dueDate === undefined
  ) {
    const updateQuery = `UPDATE  todo SET
      todo = '${todo}'
    WHERE id = '${todoId}';`;

    await dBConnObj.run(updateQuery);
    response.send("Todo Updated");
  } else if (
    todo === undefined &&
    priority === undefined &&
    status === undefined &&
    category !== undefined &&
    dueDate === undefined
  ){
    if (category !== "WORK" && category !== "LEARNING" && category !== "HOME") 
    {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      const updateQuery = `UPDATE  todo SET
      category = '${todo}'
    WHERE id = '${todoId}';`;

      await dBConnObj.run(updateQuery);
      response.send("Category Updated");
    }
}
  else if (
    todo === undefined &&
    priority === undefined &&
    status === undefined &&
    category === undefined &&
    dueDate !== undefined
  )
  {
     formattedDate = format(new Date(dueDate), "yyyy-MM-dd");
    if (!isValid(new Date(formattedDate))) {
      response.status(400);
      response.send("Invalid Due Date");
    } else {
      const updateQuery = `UPDATE  todo SET
      due_date = '${dueDate}'
    WHERE id = '${todoId}';`;

      await dBConnObj.run(updateQuery);
      response.send("Due Date Updated");
    }
}});

//API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  // console.log(request.params);

  const deleteQuery = `DELETE FROM todo
    WHERE id = '${todoId}';`;
  await dBConnObj.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
