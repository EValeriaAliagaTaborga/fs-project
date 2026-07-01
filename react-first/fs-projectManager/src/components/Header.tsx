// Componente puramente presentacional: no recibe props ni maneja estado, solo muestra contenido fijo
function Header(){
    return(
        <header className="header">
            <h1>Task Manager - Component</h1>
            <p>My first React component</p>
        </header>
    );
}
export default Header;