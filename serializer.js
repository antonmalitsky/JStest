// Для сериализации используются данные символы '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.
// Можно усилить сжатие, добавив к данным символам дополнительные знаки из ASCII.
//
// По условию ТЗ сжать до 2 раз - данных символов достаточно, чтобы более чем в два раза
// сжать массив чисел в строковом представлении. Только массивы с малым количеством элементов
// сжимаются менее чем в два раза - первый в тесте в 1,88 раза и вариант с числами от 1 до 9, 
// остальные тесты показывают сжатие более чем в 2 раза.
//
// Две основные функции:
// serialize() - принимает массив с числами от 1 до 300 и возвращает закодированную строку.
//              intToBase62() - вспомогательная функция.
// deserialize() - принимает результат из функции serialize() и возвращает исходный массив,
//              но только уже с отсортированными в нем по возрастанию числами.
//              base62ToInt() - вспомогательная функция.
//
// Остальные функции используются в тестах, например, simpleSerialize() выполняет
// простую сериализацию без кодирования - для сравнения и дальнейшего расчета коэффициента сжатия.
//
// Для проверки тестов запустить файл в node.js
// Чтобы выводился результат десериализации - раскомментировать 81 строку (написал комментарий в функции makeAndShowResult()). 


const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

console.log('Тесты');
console.log('======================================');
console.log('');

let arr = [34, 1, 3, 3, 3, 45, 299];
makeAndShowResult(arr, 'Короткий');

arr = [233, 154, 36, 67, 121, 95, 296];
makeAndShowResult(arr, 'Короткий');

arr = getRandomNumbers(50);
makeAndShowResult(arr, 'Случайные 50 чисел');

arr = getRandomNumbers(100);
makeAndShowResult(arr, 'Случайные 100 чисел');

arr = getRandomNumbers(500);
makeAndShowResult(arr, 'Случайные 500 чисел');

arr = getRandomNumbers(1000);
makeAndShowResult(arr, 'Случайные 1000 чисел');

arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
makeAndShowResult(arr, 'Все числа 1 знака');


arr = [];
for (let i = 10; i < 100; i++) {
    arr.push(i);
}
makeAndShowResult(arr, 'Все числа из двух знаков');


arr = [];
for (let i = 100; i <= 300; i++) {
    arr.push(i);
}
makeAndShowResult(arr, 'Все числа из трех знаков');


arr = [];
for (let i = 1; i <= 300; i++) {
    arr.push(i, i, i);
}
makeAndShowResult(arr, 'Каждого числа по 3 - всего чисел 900');


function makeAndShowResult(arr, title = 'Чисел: ' + arr.length) {
    console.log(title);
    console.log('--------------------------------------')
    let resultSimple = simpleSerialize(arr); // исходная простая сериализация
    let result = serialize(arr);
    console.log(resultSimple);
    console.log('');
    console.log(result);
    // раскомментировать строку ниже для проверки десериализации:
    //console.log(simpleSerialize(deserialize(result)));
    console.log('--------------------------------------')
    console.log(getCoeff(resultSimple, result)); // вывести коэффициент сжатия
    console.log('');
    console.log('');
    console.log('');
}

function simpleSerialize(arr) {
    // сделал сортировку для наглядности - т.к. в своей сериализации
    // предварительно сортирую числа (по условию ТЗ порядок не важен)
    let sorted = arr.sort((a, b) => a - b);
    return sorted.join();
}

function getCoeff(res1, res2) {
    return 'Коэффициент сжатия: ' + res1.length / res2.length;
}

function getRandomNumbers(count) {
    let min = 1,
        max = 300,
        arr = [];
    while (arr.length < count) {
        arr.push(Math.floor(Math.random() * (max - min + 1) + min));
    }
    return arr;
}




// Сериализация массива
// сортирую по возрастанию,
// вместо каждого числа нахожу разность его с предыдущим (но первое остается как есть),
// кодирую - каждому числу от 0 до 61 соответствует символ из константы digits по номеру символа в строке,
// если число больше 61, то делю на 61 и записываю в виде !xy, где x - закодированный результат
// целочисленного деления, а y - закодированный остаток от деления. Восклицательный знак
// является флагом для десериализации - что следующие за ним два символа относятся к одному числу.
// По условию ТЗ числа могут быть от 1 до 300, поэтому я не стал закладывать
// возможность большего диапазона, но при желании это легко добавить
function serialize(arr) {
    // сортируем числа по возрастанию, чтобы разница между соседними
    // числами в массиве была минимальной
    let sorted = arr.sort((a, b) => a - b),
        result = [];

    for (let i = 0; i < sorted.length; i++) {

        let curr = sorted[i];
        // откидываем числа, выходящие за диапазон от 1 до 300
        if (!curr || !Number.isInteger(curr) || curr < 1 || curr > 300) {
            continue;
        }

        let diff;

        if (i) {
            diff = sorted[i] - sorted[i - 1]; // разность чисел
        } else {
            diff = sorted[i]; // кроме первого числа
        }

        if (diff < 62) {
            result.push(intToBase62(diff));

        } else {
            // при условии, что числа от 1 до 300 (по условию задачи)
            // т.к. максимальная разность от двух чисел равна 299:
            let division = Math.floor(diff / 61), // от 1 до 4
                remainder = diff % 61; // от 0 до 56

            let encodedDivision = intToBase62(division),
                encodedRemainder = intToBase62(remainder);

            result.push('!' + encodedDivision + encodedRemainder);
        }
    }

    return result.join('');
}

function intToBase62(number) {
    return DIGITS[number];
}


function deserialize(serialized) {
    let deserialized = [],
        current,
        previous = 0,
        diff;

    for (let i = 0; i < serialized.length; i++) {

        if (serialized[i] == '!') {
            let division = base62ToInt(serialized[++i]),
                remainder = base62ToInt(serialized[++i]);

            diff = division * 61 + remainder;
        } else {
            diff = base62ToInt(serialized[i]);
        }

        current = previous + diff;
        deserialized.push(current);

        previous = current;
    }
    return deserialized;
}

function base62ToInt(number) {
    return DIGITS.indexOf(number);
}
