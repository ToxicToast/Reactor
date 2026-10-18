import { Route, Routes } from 'react-router-dom';

// Thin shell: layout frame and route table only.
// Feature routes from libs/foodfolio-ui/* are registered here; no logic lives in the app.
export function App() {
  return (
    <>
      <header>
        <h1>Foodfolio</h1>
      </header>
      <main>
        <Routes>
          <Route path="*" element={null} />
        </Routes>
      </main>
    </>
  );
}

export default App;
