import {useState, useEffect} from 'react'
import firebase from '../../firebase/clientApp'
import {useRouter} from 'next/router'

export default function Game() {
    const pos_vector = ["NW", "N", "NE", "W", "C", "E", "SW", "S", "SE"];
    const router = useRouter()
    const {gameId} = router.query
    const db = firebase.database();
    const [data, setData] = useState(null);
    const CONDITIONS = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    useEffect(() => {
        const ref = db.ref(`games/${gameId}`);
        ref.on("value", (snapshot) => {
            setData(snapshot.val());
        });
        return () => ref.off();
    })

    function test_board_enabled(pos) {
        if (data) {
            const num_cell = pos_vector.indexOf(pos)
            if (data.enabled == num_cell) {
                return ("enabled");
            } else if (data.all_enabled && !data.o_cells.includes(num_cell) && !data.x_cells.includes(num_cell)) {
                return ("enabled");
            }
            return ("disabled");
        }
    }

    function check_occupy_big_cell(played_history, new_cell) {
        played_history = played_history.concat(new_cell);
        const big_cell = Math.floor(new_cell / 9);
        const big_cell_starts = big_cell * 9;
        let in_same_big_cell = played_history.filter(x => (x >= big_cell_starts && x < big_cell_starts + 9));
        const all_pos_in_cell = in_same_big_cell.map(x => x % 9);
        if (CONDITIONS.some((a) =>
            a.every((item) => all_pos_in_cell.indexOf(item) !== -1)
        )) {
            return big_cell;
        } else {
            return -1;
        }
    }

    function checkFinalWinner(x_cells, o_cells) {
        if (CONDITIONS.some((a) =>
            a.every((item) => x_cells.indexOf(item) !== -1)
        )) {
            alert("X WON!")
        } else if (CONDITIONS.some((a) =>
            a.every((item) => o_cells.indexOf(item) !== -1)
        )) {
            alert("O WON!")
        }
    }

    function handleMove(cell, e) {
        e.stopPropagation();
        if (data && !data.x_played.includes(cell) && !data.o_played.includes(cell)) {
            let copy = {...data};
            const x_new = check_occupy_big_cell(data.x_played, cell);
            const o_new = check_occupy_big_cell(data.o_played, cell);
            const big_cell = Math.floor(cell % 9);
            if (data.o_cells.includes(big_cell) || data.x_cells.includes(big_cell) || big_cell == x_new || big_cell == o_new) {
                copy.all_enabled = true;
            } else {
                copy.all_enabled = false;
                copy.enabled = big_cell;
            }
            if (data.x_turn) {
                copy.x_played = data.x_played.concat(cell);
                if (x_new != -1) {
                    copy.x_cells = data.x_cells.concat(x_new);
                }

            } else {
                copy.o_played = data.o_played.concat(cell);
                if (o_new != -1) {
                    copy.o_cells = data.o_cells.concat(o_new);
                }
            }
            copy.x_turn = !data.x_turn;
            db.ref(`games/${gameId}`).set(copy).then(() => {
                checkFinalWinner(copy.x_cells, copy.o_cells);
            });
        }
    }


    function what_should_be_here(cell) {
        if (data) {
            if (data.x_played.includes(cell)) {
                return "X";
            } else if (data.o_played.includes(cell)) {
                return "O";
            }
        }
    }

    function checkWinner(cell) {
        if (data.x_cells.includes(cell)) {
            return "X";
        }
        if (data.o_cells.includes(cell)) {
            return "O";
        }
        return "";
    }

    if (!data) return <div>Loading Game</div>;
    return (
        <div className="container">
            <div id="game" className="enabled">
                <table>
                    <tr>
                        <td className={"smallBoard NW " + test_board_enabled("NW")} data-won={checkWinner(0)}>
                            <table>
                                <tr>
                                    <td className={"cell NW " + test_board_enabled("NW")}
                                        onClick={(e) => handleMove(0, e)}>
                                        {what_should_be_here(0)}
                                    </td>
                                    <td className={"cell N " + test_board_enabled("NW")}
                                        onClick={(e) => handleMove(1, e)}>
                                        {what_should_be_here(1)}
                                    </td>
                                    <td className={"cell NE " + test_board_enabled("NW")}
                                        onClick={(e) => handleMove(2, e)}>
                                        {what_should_be_here(2)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={"cell W " + test_board_enabled("NW")}
                                        onClick={(e) => handleMove(3, e)}>
                                        {what_should_be_here(3)}
                                    </td>
                                    <td className={"cell C " + test_board_enabled("NW")}
                                        onClick={(e) => handleMove(4, e)}>
                                        {what_should_be_here(4)}
                                    </td>
                                    <td className={"cell E " + test_board_enabled("NW")}
                                        onClick={(e) => handleMove(5, e)}>
                                        {what_should_be_here(5)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={"cell SW " + test_board_enabled("NW")}
                                        onClick={(e) => handleMove(6, e)}>
                                        {what_should_be_here(6)}
                                    </td>
                                    <td className={"cell S " + test_board_enabled("NW")}
                                        onClick={(e) => handleMove(7, e)}>
                                        {what_should_be_here(7)}
                                    </td>
                                    <td className={"cell SE " + test_board_enabled("NW")}
                                        onClick={(e) => handleMove(8, e)}>
                                        {what_should_be_here(8)}
                                    </td>
                                </tr>
                            </table>
                        </td>
                        <td className={"smallBoard N " + test_board_enabled("N")} data-won={checkWinner(1)}>
                            <table>
                                <tr>
                                    <td className={"cell NW " + test_board_enabled("N")}
                                        onClick={(e) => handleMove(9, e)}>
                                        {what_should_be_here(9)}
                                    </td>
                                    <td className={"cell N " + test_board_enabled("N")}
                                        onClick={(e) => handleMove(10, e)}>
                                        {what_should_be_here(10)}
                                    </td>
                                    <td className={"cell NE " + test_board_enabled("N")}
                                        onClick={(e) => handleMove(11, e)}>
                                        {what_should_be_here(11)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={"cell W " + test_board_enabled("N")}
                                        onClick={(e) => handleMove(12, e)}>
                                        {what_should_be_here(12)}
                                    </td>
                                    <td className={"cell C " + test_board_enabled("N")}
                                        onClick={(e) => handleMove(13, e)}>
                                        {what_should_be_here(13)}
                                    </td>
                                    <td className={"cell E " + test_board_enabled("N")}
                                        onClick={(e) => handleMove(14, e)}>
                                        {what_should_be_here(14)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={"cell SW " + test_board_enabled("N")}
                                        onClick={(e) => handleMove(15, e)}>
                                        {what_should_be_here(15)}
                                    </td>
                                    <td className={"cell S " + test_board_enabled("N")}
                                        onClick={(e) => handleMove(16, e)}>
                                        {what_should_be_here(16)}
                                    </td>
                                    <td className={"cell SE " + test_board_enabled("N")}
                                        onClick={(e) => handleMove(17, e)}>
                                        {what_should_be_here(17)}
                                    </td>
                                </tr>
                            </table>
                        </td>
                        <td className={"smallBoard NE " + test_board_enabled("NE")} data-won={checkWinner(2)}>
                            <table>
                                <tr>
                                    <td className={"cell NW " + test_board_enabled("NE")}
                                        onClick={(e) => handleMove(18, e)}>
                                        {what_should_be_here(18)}
                                    </td>
                                    <td className={"cell N " + test_board_enabled("NE")}
                                        onClick={(e) => handleMove(19, e)}>
                                        {what_should_be_here(19)}
                                    </td>
                                    <td className={"cell NE " + test_board_enabled("NE")}
                                        onClick={(e) => handleMove(20, e)}>
                                        {what_should_be_here(20)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={"cell W " + test_board_enabled("NE")}
                                        onClick={(e) => handleMove(21, e)}>
                                        {what_should_be_here(21)}
                                    </td>
                                    <td className={"cell C " + test_board_enabled("NE")}
                                        onClick={(e) => handleMove(22, e)}>
                                        {what_should_be_here(22)}
                                    </td>
                                    <td className={"cell E " + test_board_enabled("NE")}
                                        onClick={(e) => handleMove(23, e)}>
                                        {what_should_be_here(23)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={"cell SW " + test_board_enabled("NE")}
                                        onClick={(e) => handleMove(24, e)}>
                                        {what_should_be_here(24)}
                                    </td>
                                    <td className={"cell S " + test_board_enabled("NE")}
                                        onClick={(e) => handleMove(25, e)}>
                                        {what_should_be_here(25)}
                                    </td>
                                    <td className={"cell SE " + test_board_enabled("NE")}
                                        onClick={(e) => handleMove(26, e)}>
                                        {what_should_be_here(26)}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td className={"smallBoard W " + test_board_enabled("W")} data-won={checkWinner(3)}>
                            <table>
                                <tr>
                                    <td className={"cell NW " + test_board_enabled("W")}
                                        onClick={(e) => handleMove(27, e)}>
                                        {what_should_be_here(27)}
                                    </td>
                                    <td className={"cell N " + test_board_enabled("W")}
                                        onClick={(e) => handleMove(28, e)}>
                                        {what_should_be_here(28)}
                                    </td>
                                    <td className={"cell NE " + test_board_enabled("W")}
                                        onClick={(e) => handleMove(29, e)}>
                                        {what_should_be_here(29)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={"cell W " + test_board_enabled("W")}
                                        onClick={(e) => handleMove(30, e)}>
                                        {what_should_be_here(30)}
                                    </td>
                                    <td className={"cell C " + test_board_enabled("W")}
                                        onClick={(e) => handleMove(31, e)}>
                                        {what_should_be_here(31)}
                                    </td>
                                    <td className={"cell E " + test_board_enabled("W")}
                                        onClick={(e) => handleMove(32, e)}>
                                        {what_should_be_here(32)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={"cell SW " + test_board_enabled("W")}
                                        onClick={(e) => handleMove(33, e)}>
                                        {what_should_be_here(33)}
                                    </td>
                                    <td className={"cell S " + test_board_enabled("W")}
                                        onClick={(e) => handleMove(34, e)}>
                                        {what_should_be_here(34)}
                                    </td>
                                    <td className={"cell SE " + test_board_enabled("W")}
                                        onClick={(e) => handleMove(35, e)}>
                                        {what_should_be_here(35)}
                                    </td>
                                </tr>
                            </table>
                        </td>
                        <td className={"smallBoard NE " + test_board_enabled("C")} data-won={checkWinner(4)}>
                            <table>
                                <tr>
                                    <td className={"cell NW " + test_board_enabled("C")}
                                        onClick={(e) => handleMove(36, e)}>
                                        {what_should_be_here(36)}
                                    </td>
                                    <td className={"cell N " + test_board_enabled("C")}
                                        onClick={(e) => handleMove(37, e)}>
                                        {what_should_be_here(37)}
                                    </td>
                                    <td className={"cell NE " + test_board_enabled("C")}
                                        onClick={(e) => handleMove(38, e)}>
                                        {what_should_be_here(38)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={"cell W " + test_board_enabled("C")}
                                        onClick={(e) => handleMove(39, e)}>
                                        {what_should_be_here(39)}
                                    </td>
                                    <td className={"cell C " + test_board_enabled("C")}
                                        onClick={(e) => handleMove(40, e)}>
                                        {what_should_be_here(40)}
                                    </td>
                                    <td className={"cell E " + test_board_enabled("C")}
                                        onClick={(e) => handleMove(41, e)}>
                                        {what_should_be_here(41)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={"cell SW " + test_board_enabled("C")}
                                        onClick={(e) => handleMove(42, e)}>
                                        {what_should_be_here(42)}
                                    </td>
                                    <td className={"cell S " + test_board_enabled("C")}
                                        onClick={(e) => handleMove(43, e)}>
                                        {what_should_be_here(43)}
                                    </td>
                                    <td className={"cell SE " + test_board_enabled("C")}
                                        onClick={(e) => handleMove(44, e)}>
                                        {what_should_be_here(44)}
                                    </td>
                                </tr>
                            </table>
                        </td>
                        <td className={"smallBoard E " + test_board_enabled("E")} data-won={checkWinner(5)}>
                            <table>
                                <tr>
                                    <td className={"cell NW " + test_board_enabled("E")}
                                        onClick={(e) => handleMove(45, e)}>
                                        {what_should_be_here(45)}
                                    </td>
                                    <td className={"cell N " + test_board_enabled("E")}
                                        onClick={(e) => handleMove(46, e)}>
                                        {what_should_be_here(46)}
                                    </td>
                                    <td className={"cell NE " + test_board_enabled("E")}
                                        onClick={(e) => handleMove(47, e)}>
                                        {what_should_be_here(47)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={"cell W " + test_board_enabled("E")}
                                        onClick={(e) => handleMove(48, e)}>
                                        {what_should_be_here(48)}
                                    </td>
                                    <td className={"cell C " + test_board_enabled("E")}
                                        onClick={(e) => handleMove(49, e)}>
                                        {what_should_be_here(49)}
                                    </td>
                                    <td className={"cell E " + test_board_enabled("E")}
                                        onClick={(e) => handleMove(50, e)}>
                                        {what_should_be_here(50)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={"cell SW " + test_board_enabled("E")}
                                        onClick={(e) => handleMove(51, e)}>
                                        {what_should_be_here(51)}
                                    </td>
                                    <td className={"cell S " + test_board_enabled("E")}
                                        onClick={(e) => handleMove(52, e)}>
                                        {what_should_be_here(52)}
                                    </td>
                                    <td className={"cell SE " + test_board_enabled("E")}
                                        onClick={(e) => handleMove(53, e)}>
                                        {what_should_be_here(53)}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td className={"smallBoard SW " + test_board_enabled("SW")} data-won={checkWinner(6)}>
                            <table>
                                <tr>
                                    <td className={"cell NW " + test_board_enabled("SW")}
                                        onClick={(e) => handleMove(54, e)}>
                                        {what_should_be_here(54)}
                                    </td>
                                    <td className={"cell N " + test_board_enabled("SW")}
                                        onClick={(e) => handleMove(55, e)}>
                                        {what_should_be_here(55)}
                                    </td>
                                    <td className={"cell NE " + test_board_enabled("SW")}
                                        onClick={(e) => handleMove(56, e)}>
                                        {what_should_be_here(56)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={"cell W " + test_board_enabled("SW")}
                                        onClick={(e) => handleMove(57, e)}>
                                        {what_should_be_here(57)}
                                    </td>
                                    <td className={"cell C " + test_board_enabled("SW")}
                                        onClick={(e) => handleMove(58, e)}>
                                        {what_should_be_here(58)}
                                    </td>
                                    <td className={"cell E " + test_board_enabled("SW")}
                                        onClick={(e) => handleMove(59, e)}>
                                        {what_should_be_here(59)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={"cell SW " + test_board_enabled("SW")}
                                        onClick={(e) => handleMove(60, e)}>
                                        {what_should_be_here(60)}
                                    </td>
                                    <td className={"cell S " + test_board_enabled("SW")}
                                        onClick={(e) => handleMove(61, e)}>
                                        {what_should_be_here(61)}
                                    </td>
                                    <td className={"cell SE " + test_board_enabled("SW")}
                                        onClick={(e) => handleMove(62, e)}>
                                        {what_should_be_here(62)}
                                    </td>
                                </tr>
                            </table>
                        </td>
                        <td className={"smallBoard S " + test_board_enabled("S")} data-won={checkWinner(7)}>
                            <table>
                                <tr>
                                    <td className={"cell NW " + test_board_enabled("S")}
                                        onClick={(e) => handleMove(63, e)}>
                                        {what_should_be_here(63)}
                                    </td>
                                    <td className={"cell N " + test_board_enabled("S")}
                                        onClick={(e) => handleMove(64, e)}>
                                        {what_should_be_here(64)}
                                    </td>
                                    <td className={"cell NE " + test_board_enabled("S")}
                                        onClick={(e) => handleMove(65, e)}>
                                        {what_should_be_here(65)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={"cell W " + test_board_enabled("S")}
                                        onClick={(e) => handleMove(66, e)}>
                                        {what_should_be_here(66)}
                                    </td>
                                    <td className={"cell C " + test_board_enabled("S")}
                                        onClick={(e) => handleMove(67, e)}>
                                        {what_should_be_here(67)}
                                    </td>
                                    <td className={"cell E " + test_board_enabled("S")}
                                        onClick={(e) => handleMove(68, e)}>
                                        {what_should_be_here(68)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={"cell SW " + test_board_enabled("S")}
                                        onClick={(e) => handleMove(69, e)}>
                                        {what_should_be_here(69)}</td>
                                    <td className={"cell S " + test_board_enabled("S")}
                                        onClick={(e) => handleMove(70, e)}>
                                        {what_should_be_here(70)}
                                    </td>
                                    <td className={"cell SE " + test_board_enabled("S")}
                                        onClick={(e) => handleMove(71, e)}>
                                        {what_should_be_here(71)}</td>
                                </tr>
                            </table>
                        </td>
                        <td className={"smallBoard SE " + test_board_enabled("SE")} data-won={checkWinner(8)}>
                            <table>
                                <tr>
                                    <td className={"cell NW " + test_board_enabled("SE")}
                                        onClick={(e) => handleMove(72, e)}>
                                        {what_should_be_here(72)}
                                    </td>
                                    <td className={"cell N " + test_board_enabled("SE")}
                                        onClick={(e) => handleMove(73, e)}>
                                        {what_should_be_here(73)}
                                    </td>
                                    <td className={"cell NE " + test_board_enabled("SE")}
                                        onClick={(e) => handleMove(74, e)}>
                                        {what_should_be_here(74)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={"cell W " + test_board_enabled("SE")}
                                        onClick={(e) => handleMove(75, e)}>
                                        {what_should_be_here(75)}
                                    </td>
                                    <td className={"cell C " + test_board_enabled("SE")}
                                        onClick={(e) => handleMove(76, e)}>
                                        {what_should_be_here(76)}
                                    </td>
                                    <td className={"cell E " + test_board_enabled("SE")}
                                        onClick={(e) => handleMove(77, e)}>
                                        {what_should_be_here(77)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={"cell SW " + test_board_enabled("SE")}
                                        onClick={(e) => handleMove(78, e)}>
                                        {what_should_be_here(78)}
                                    </td>
                                    <td className={"cell S " + test_board_enabled("SE")}
                                        onClick={(e) => handleMove(79, e)}>
                                        {what_should_be_here(79)}
                                    </td>
                                    <td className={"cell SE " + test_board_enabled("SE")}
                                        onClick={(e) => handleMove(80, e)}>
                                        {what_should_be_here(80)}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    )
}