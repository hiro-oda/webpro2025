document.addEventListener('DOMContentLoaded', () => {
  // HTML要素の取得
  const chartCanvas = document.getElementById('stockChart');
  const predictButton = document.getElementById('predictButton');
  const nextButton = document.getElementById('nextButton');
  const predictionInput = document.getElementById('predictionInput');
  const resultArea = document.getElementById('resultArea');
  const instruction = document.getElementById('instruction');

  let chart; // グラフのインスタンスを保持

  // 株価データを取得してグラフを描画する関数
  async function fetchAndDrawChart() {
    try {
      // バックエンドAPIを呼び出す
      const response = await fetch('/api/stock-price/random');
      if (!response.ok) throw new Error('データの取得に失敗しました。');
      const stockData = await response.json();

      const labels = stockData.map(d => new Date(d.date).toLocaleDateString());
      const data = stockData.map(d => d.price);

      // 既存のグラフがあれば破棄する
      if (chart) chart.destroy();

      // 新しいグラフを作成
      chart = new Chart(chartCanvas.getContext('2d'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: '株価の推移',
            data: data,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        }
      });
      // UIを初期状態に戻す
      resetUI();
    } catch (error) {
      resultArea.textContent = error.message;
      resultArea.style.color = 'red';
    }
  }

  // 予測ボタンがクリックされたときの処理
  predictButton.addEventListener('click', async () => {
    const predictedValue = parseFloat(predictionInput.value);
    if (isNaN(predictedValue)) {
      alert('有効な数値を入力してください。');
      return;
    }

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predictedValue })
      });
      if (!response.ok) throw new Error('予測の送信に失敗しました。');
      const result = await response.json();

      // 結果を表示
      const error = Math.abs(result.error);
      resultArea.innerHTML = `正解は <strong>${result.actualValue}</strong> でした。<br>誤差: ${error.toFixed(2)} (${result.message})`;
      resultArea.style.color = error < result.actualValue * 0.02 ? 'green' : 'orange';

      // グラフに正解の値を追加
      chart.data.labels.push('次の日 (正解)');
      chart.data.datasets[0].data.push(result.actualValue);
      chart.update();

      // UIの状態を更新
      predictButton.classList.add('hidden');
      predictionInput.classList.add('hidden');
      nextButton.classList.remove('hidden');
      instruction.classList.add('hidden');

    } catch (error) {
        resultArea.textContent = error.message;
        resultArea.style.color = 'red';
    }
  });

  // 「次の問題へ」ボタンがクリックされたときの処理
  nextButton.addEventListener('click', fetchAndDrawChart);

  // UIをリセットする関数
  function resetUI() {
    resultArea.textContent = '';
    predictionInput.value = '';
    instruction.classList.remove('hidden');
    predictButton.classList.remove('hidden');
    predictionInput.classList.remove('hidden');
    nextButton.classList.add('hidden');
  }

  // 最初にグラフを描画
  fetchAndDrawChart();
});