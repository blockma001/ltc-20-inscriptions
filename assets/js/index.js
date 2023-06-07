
const baseUrl = 'https://btczoo.co';
// const baseUrl = 'http://localhost:8099';
const v3UrlStr = baseUrl+'/ttt/V3/pay/';

const numPlusButton = document.getElementById("numPlus")
const numReduceButton = document.getElementById("numReduce")
const numToMaxButton = document.getElementById("numToMax")
numPlusButton.onclick = numPlus
numReduceButton.onclick = numReduce
numToMaxButton.onclick = numToMax

let maxNum = 10;
let unitPrice = 0.15;
let priceUSD = 92.53;
let totalLTC = 0;
let totalUSD = 0;
let onceOrderId = '';
let intervalFlag = false;

let isPlayTotal = 0;
let isPlayReally = 0;



function numPlus() {
  let nowNum = Number($("#numValue").val());
  if (nowNum < maxNum) {
    changeNumWithTotal(nowNum + 1);
  }
}

function numReduce() {
  let nowNum = Number($("#numValue").val());
  if (nowNum > 1) {
    changeNumWithTotal(nowNum - 1);
  }
}

function numToMax() {
  changeNumWithTotal(maxNum);
}

function changeNumWithTotal(num){
  $("#numValue").val(num);
  totalLTC = floatMul(num,unitPrice);
  totalUSD = floatMul(totalLTC,priceUSD);
  // 0.3LTC(≈270USD)
  $('#totalFee').text(totalLTC+' LTC(≈' + totalUSD +'USD)')
}

function toPay() {
  let payerAddress = $('#payerAddress').val();

  if (payerAddress === ''){
    alert("Please input your litecoin address!")
  }

  $.ajax({
    url: 'https://api.mixpay.me/v1/one_time_payment?payeeId=92c73544-f868-3637-8069-02ab4ba8a61c&settlementAssetId=94213408-4ee7-3150-a9c4-9c5cce421c78&quoteAssetId=usd&isTemp=1&quoteAmount=' + totalUSD,
    type: 'POST',
    success: function (resultRes) {
      // 请求成功后的处理
      console.log(resultRes);
      if (resultRes.code === 0) {
        onceOrderId = resultRes.data.code;
        let orderNum = $("#numValue").val();
        // 请求后端接口，存入数据库
        let addObj ={
          "address":payerAddress,
          "orderCode":onceOrderId,
          "orderNum":orderNum
        }
        $.ajax({
          url: v3UrlStr + 'addOrder',
          type: 'POST',
          data: JSON.stringify(addObj),
          dataType: 'json',
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'ttToken': myEncrypt()
          },
          success: function (resultRes) {
            if (resultRes.code === 0) {
              window.open('https://mixpay.me/code/'+onceOrderId);
              updatedProItem();
              setMiniButton(false);
            }
          },
          error: function (xhr, textStatus, errorThrown) {
            // 请求失败后的处理
            console.log(666666);
          }
        });
      }
    },
    error: function (xhr, textStatus, errorThrown) {
      // 请求失败后的处理
      console.log(666666);
    }
  });
}

//加
function floatAdd(arg1,arg2){
  var r1,r2,m;
  try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}
  try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}
  m=Math.pow(10,Math.max(r1,r2));
  return (arg1*m+arg2*m)/m;
}

//减
function floatSub(arg1,arg2){
  var r1,r2,m,n;
  try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}
  try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}
  m=Math.pow(10,Math.max(r1,r2));
  //动态控制精度长度
  n=(r1>=r2)?r1:r2;
  return ((arg1*m-arg2*m)/m).toFixed(n);
}

//乘
function floatMul(arg1,arg2)   {
  var m=0,s1=arg1.toString(),s2=arg2.toString();
  try{m+=s1.split(".")[1].length}catch(e){}
  try{m+=s2.split(".")[1].length}catch(e){}
  return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m);
}

//除
function floatDiv(arg1,arg2){
  var t1=0,t2=0,r1,r2;
  try{t1=arg1.toString().split(".")[1].length}catch(e){}
  try{t2=arg2.toString().split(".")[1].length}catch(e){}

  r1=Number(arg1.toString().replace(".",""));

  r2=Number(arg2.toString().replace(".",""));
  return (r1/r2)*Math.pow(10,t2-t1);
}


window.updatedProItem = function (proItem) {
  /*let allTime = 60*60*1000;
  if ($.exists('#tm-if-expired')) {
    // Update the count down every 1 second
    var x = setInterval(function() {
      // Get todays date and time


      // Find the distance between now an the count down date
      allTime = allTime - 1000;
      var distanceEnd = allTime ;

      // Time calculations for days, hours, minutes and seconds
      var days = 0;
      var hours = 0;
      var minutes = 0;
      var seconds = 0;

      // 每10秒，调用接口查询
      if (distanceEnd/1000 % 10 === 0){
        getOrderStatus();
      }

      if (distanceEnd === 0){
        clearInterval(x);
      }

      if (intervalFlag){
        clearInterval(x);
      }

      // Time calculations for days, hours, minutes and seconds
      // days = Math.floor(distanceEnd / (1000 * 60 * 60 * 24));
      // hours = Math.floor((distanceEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      // minutes = Math.floor((distanceEnd % (1000 * 60 * 60)) / (1000 * 60));
      // seconds = Math.floor((distanceEnd % (1000 * 60)) / 1000);
      // days = Math.floor(distanceEnd / (1000 * 60 * 60 * 24));
      // hours = Math.floor((distanceEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      minutes = Math.floor((distanceEnd % (1000 * 60 * 60)) / (1000 * 60));
      seconds = Math.floor((distanceEnd % (1000 * 60)) / 1000);

      // Output the result in an element with id="demo"
      $('#tm-count-minutes').text(minutes<10?'0'+minutes:minutes);
      $('#tm-count-seconds').text(seconds<10?'0'+seconds:seconds);

      // setMiniBtn(isDisable)
    }, 1000);
  }*/

  let i = 0;
  var x = setInterval(function() {
    // 每10秒，调用接口查询
    if (i % 10 === 0){
      getOrderStatus();
      getRealTotal();
    }
    if (intervalFlag){
      setMiniButton(true);
      clearInterval(x);
      alert("Mint Success! You Will Receive NFTs In 24h.")
      getRealTotal();
      intervalFlag = false;
    }
    i++;
    // setMiniBtn(isDisable)
  }, 1000);
}

function getUSD(){
  $.ajax({
    url: 'https://min-api.cryptocompare.com/data/price?fsym=LTC&tsyms=USD',
    type: 'GET',
    success: function (resultRes) {
      // 请求成功后的处理
      console.log(resultRes);
      priceUSD = resultRes.USD;
      changeNumWithTotal(1)
    },
    error: function (xhr, textStatus, errorThrown) {
      // 请求失败后的处理
      console.log(666666);
    }
  });
}

function getOrderStatus() {
  $.ajax({
    url: 'https://api.mixpay.me/v1/payments_result?traceId=' + onceOrderId,
    type: 'GET',
    success: function (resultRes) {
      if (resultRes.code === 0) {
        let orderStatus = resultRes.data.status;
        if (orderStatus === 'success') {
        // if (orderStatus === 'unpaid') {
          // 入库改成 1
          let updateObj = {
            "orderCode": onceOrderId
          }
          $.ajax({
            url: v3UrlStr + 'updateOrder',
            type: 'POST',
            data: JSON.stringify(updateObj),
            dataType: 'json',
            contentType: 'application/json',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'ttToken': myEncrypt()
            },
            success: function (resultRes) {
              if (resultRes.code === 0) {
                intervalFlag = true;
              }
            },
            error: function (xhr, textStatus, errorThrown) {
              // 请求失败后的处理
              console.log(666666);
            }
          });
        }
      }
    },
    error: function (xhr, textStatus, errorThrown) {
      // 请求失败后的处理
      console.log(666666);
    }
  });
}

function setMiniButton(disable){
  if (!disable){
    // 按钮不可点击 转圈圈
    // $('#toPayButton').addClass('miniButtonDisable');
    document.getElementById('toPayDiv').innerHTML = '<a class="default-btn default-btn--secondary miniButtonDisable" data-bs-toggle="modal" data-bs-target="#wallet-option">' +
        '<div class="sp sp-circle" style="float: left;width: 20px;height: 20px;margin-right: 10px;"></div></a>';
  }else{
    // $('#toPayDiv').innerHTML('')
    document.getElementById('toPayDiv').innerHTML = '<a class="default-btn default-btn--secondary" data-bs-toggle="modal" data-bs-target="#wallet-option">Mint Now</a>';
  }
}

function getRealTotal(){
  $.ajax({
    url: v3UrlStr + 'getAllOrder',
    type: 'GET',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'ttToken': myEncrypt()
    },
    success: function (resultRes) {
      if (resultRes.code === 0) {
        isPlayTotal = resultRes.data.isPlayTotal;
        isPlayReally = resultRes.data.isPlayReally;

        let textC = isPlayTotal>isPlayReally?isPlayTotal:isPlayReally;
        textC = 10000 - textC;
        let textA = 'Available To Mint: ';
        let textB = ' /10000';
        $('#remainText').text(textA+textC+textB);
      }
    },
    error: function (xhr, textStatus, errorThrown) {
      // 请求失败后的处理
      console.log(666666);
    }
  });
}


// 倒计时需要用的js
$.exists = function(selector) {
  return ($(selector).length > 0);
}

/* 加密方法 */
window.myEncrypt = function () {

  const word = new Date().getTime() + ',abcd';
  const key = CryptoJS.enc.Utf8.parse("1234567890hijklm"); // 十六位十六进制数作为密钥
  const iv = CryptoJS.enc.Utf8.parse('1234567890abcdef'); // 十六位十六进制数作为密钥偏移量

  const srcs = CryptoJS.enc.Utf8.parse(word);
  const encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
}

window.onload = function() {
  getUSD();
  getRealTotal();
}
