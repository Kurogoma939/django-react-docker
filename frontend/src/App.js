import React, { useEffect, useState } from 'react'

function App() {
    const [tasks, setTasks] = useState([])

    useEffect(() => {
        const apiUrl = 'http://127.0.0.1/api/'
        fetch(`${apiUrl}task/`)
            .then(data => data.json())
            .then(res => {
                setTasks(res)
            })
    }, [setTasks])
    return (
        <ul>
            {tasks.map(task => (
                <li key={task.id}>{task.name}</li>
            ))}
        </ul>
    );
}

export default App;