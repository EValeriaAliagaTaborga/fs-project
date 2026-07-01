// A diferencia de Header, este componente ya no es estático: recibe las estadísticas
// como props ya calculadas desde App, no las calcula por su cuenta
type FooterProps = {
    tasksTotal: number; // cantidad total de tareas, sin importar su estado
    tasksCompleted: number; // cuántas de esas tareas están marcadas como completadas
    tasksRemaining: number; // cuántas todavía están pendientes (no completadas)
};

function Footer(props: FooterProps) {
	return (
		<footer className="footer">
			{/* Agrupamos las 3 estadísticas en una sola fila de "badges" en vez de
			    párrafos sueltos, para que se puedan escanear de un vistazo */}
			<div className="footer-stats">
				<p className="footer-stat">
					Tasks Total: <span className="total-tasks-count">{props.tasksTotal}</span>
				</p>
				<p className="footer-stat footer-stat--completed">
					Tasks completed: <span className="completed-tasks-count">{props.tasksCompleted}</span>
				</p>
				<p className="footer-stat footer-stat--remaining">
					Tasks remaining: <span className="remaining-tasks-count">{props.tasksRemaining}</span>
				</p>
			</div>
			<div className="footer-credit">
				<p>2026 - By: Ericka Valeria Aliaga Taborga</p>
			</div>
		</footer>
	);
}
export default Footer;
