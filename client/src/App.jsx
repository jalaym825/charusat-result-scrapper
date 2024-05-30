import Table from '@mui/joy/Table';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function App() {
  const [count, setCount] = useState(0)
  const [results, setResults] = useState([])
  useEffect(() => {
    axios.get('http://localhost:3000/getResults').then(res => {
      console.log(res.data)
      setResults(res.data)
    })
  }, [])

  return (
    <>
      <div>
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
              <th rowSpan={2} style={{ textAlign: 'center' }}>CGPA</th>
              <th rowSpan={2} style={{ textAlign: 'center' }}>Download</th>
            </tr>
            <tr>
              {
                results[0]?.subjects.map(subject => (
                  <>
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
                  </>
                ))
              }
            </tr>
          </thead>
          <tbody>
            {results.map(student => (
              <tr key={student.id}>
                <td>{student.id.toUpperCase()}</td>
                {student.subjects.map(subject => (
                  <>
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
                  </>
                ))}
                <td>{student.sgpa}</td>
                <td>{student.cgpa}</td>
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
