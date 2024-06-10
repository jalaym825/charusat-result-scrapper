import Table from '@mui/joy/Table';
import axios from 'axios';
import { useEffect, useState, Fragment } from 'react';
import { Link } from 'react-router-dom';

function App() {
  // const [count, setCount] = useState(0)
  const [isDeclared, setIsDeclared] = useState(false)
  const [results, setResults] = useState([])
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/isDeclared`).then(res => {
      setIsDeclared(res.data.declared)
      if (res.data.declared) {
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/getResults`).then(res => {
          console.log(res.data)
          setResults(res.data)
        })
      }
    })
  }, [])

  console.log(import.meta.env.VITE_BACKEND_URL);
  return (
    <>
      <div>
        {
          !isDeclared &&
          <div>
            <h1 style={{ textAlign: 'center' }}>Results not declared yet!</h1>
          </div>
        }
        {
          isDeclared &&
          <div>
            <h1 style={{ textAlign: 'center' }}>Results declared!</h1>
          </div>
        }
        <Table borderAxis="both">
          <thead>
            <tr>
              <th rowSpan={2} style={{ textAlign: 'center' }}>ID</th>
              {
                results[0]?.subjects.map(subject => (
                  <th colSpan={subject.theoryGrade && subject.practicalGrade ? 2 : 1} style={{ textAlign: 'center' }}>
                    {subject.code} - {subject.name}
                  </th>
                ))
              }
              {/* <th colSpan={2} style={{ textAlign: 'center' }}>
                CSPIT-CE
              </th> */}
              <th rowSpan={2} style={{ textAlign: 'center' }}>SGPA</th>
              <th rowSpan={2} style={{ textAlign: 'center' }}>Download</th>
            </tr>
            <tr>
              {
                results[0]?.subjects.map((subject, index) => (
                  <Fragment key={index}>
                    {
                      subject.theoryGrade && subject.practicalGrade &&
                      <>
                        <th style={{ textAlign: 'center' }}>Theory</th>
                        <th style={{ textAlign: 'center' }}>Practical</th>
                      </>
                    }
                    {
                      subject.theoryGrade && !subject.practicalGrade &&
                      <th style={{ textAlign: 'center' }}>Theory</th>

                    }
                    {
                      subject.practicalGrade && !subject.theoryGrade &&
                      <th style={{ textAlign: 'center' }}>Practical</th>
                    }
                  </Fragment>
                ))
              }
            </tr>
          </thead>
          <tbody>
            {results.map(student => (
              <tr key={student.id}>
                <td>{student.id.toUpperCase()}</td>
                {student.subjects.map((subject, index) => (
                  <Fragment key={index}>
                    {subject.theoryGrade && subject.practicalGrade &&
                      <>
                        <td>{subject.theoryGrade}</td>
                        <td>{subject.practicalGrade}</td>
                      </>
                    }
                    {subject.theoryGrade && !subject.practicalGrade &&
                      <>
                        <td>{subject.theoryGrade}</td>
                      </>
                    }
                    {!subject.theoryGrade && subject.practicalGrade &&
                      <>
                        <td>{subject.practicalGrade}</td>
                      </>
                    }
                  </Fragment>
                ))}
                <td>{student.sgpa}</td>
                <td style={{ textAlign: 'center' }}><Link target='_blank' to={`${import.meta.env.VITE_BACKEND_URL}/results/${student.id}`}>Download</Link></td>
              </tr>
            ))}
          </tbody>
        </Table>

      </div>
    </>
  )
}

export default App
