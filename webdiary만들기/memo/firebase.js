// Initialize Firebase
        var config = {
          apiKey: "AIzaSyDuILSES-HFyiS7uXhRNc5Idc7G9oek9Do",
          authDomain: "memo-b1e61.firebaseapp.com",
          databaseURL: "https://memo-b1e61.firebaseio.com",
          projectId: "memo-b1e61",
          storageBucket: "memo-b1e61.appspot.com",
          messagingSenderId: "829856771419"
        };

        firebase.initializeApp(config);
//유저정보 객체
var userInfo;
//중복저장 방지용 키
var selectedKey;

//사용자 인증용 객체
var auth;
//사용자 인증을 위한 코드.
auth = firebase.auth();
//구글 아이디를 이용한 인증.
var authProvider;

//인증 상태를 체크.
auth.onAuthStateChanged(function (user) {
  if (user) {
    //인증 성공시
    userInfo = user;
    console.log(userInfo);
    get_memo_list();
  } else {
    //인증 실패시. 인증창 출력.
    console.log("not logged in");
  }
});

//데이터베이스 접근용 객체
var database;
//데이터베이스 접근을 위한 코드
database = firebase.database();

//메모 리스트르 가져오는 함수.
function get_memo_list() {
  //firebase의 database의 json 트리의 경로를 입력한다.
  var memoRef = database.ref('memos/' + userInfo.uid);

  memoRef.on('child_added', on_child_added);
  memoRef.on('child_changed', on_child_changed);
}

//메모 리스트 갱신 함수.
function on_child_changed(data) {
  var key = data.key;
  var txt = data.val().txt;
  var title = txt.substr(0, txt.indexOf('\n'));

  $("#" + key + " > .title").text(title);
  $("#" + key + " > .txt").text(txt);
}

//메모 리스트 추가 함수.
function on_child_added(data) {
  var key = data.key;
  var memodata = data.val();
  var txt = memodata.txt;
  var title = txt.substr(0, txt.indexOf('\n'));
  var firstTxt = txt.substr(0, 1);

  console.log(data.val());
  //메모 리스트 요소 HTML 코드.
  var html =
    "<li id='" + key + "' class=\"collection-item avatar\" onclick=\"fn_get_data_one(this.id);\" >" +
    "<i class=\"material-icons circle red\">" + firstTxt + "</i>" +
    "<span class=\"title\">" + title + "</span>" +
    "<p class='txt'>" + txt + "<br>" +
    "</p>" +
    "<a onClick=\"fn_delete_data('" + key + "')\" class = \"secondary-content\"><i class = \"material-icons\">grade</i></a>" +
    "</li>";

  //jquery : collection 클래스에 확장.
  $(".collection").append(html);
}

//데이터 검색 쿼리.
function fn_get_data_one(key) {
  selectedKey = key;
  var memoRef = database.ref('memos/' + userInfo.uid + '/' + key).once('value').then(function (snapshot) {
    $(".textarea").val(snapshot.val().txt);
  });
}

//메모 삭제 함수.
function fn_delete_data(key) {
  if (!confirm('삭제하시겠습니까?')) {
    return;
  }
  var memoRef = database.ref('memos/' + userInfo.uid + '/' + key);
  memoRef.remove();
  $("#" + key).remove();

  initMemo();
}

//데이터 저장함수.
function save_data() {
  var memoRef = database.ref('memos/' + userInfo.uid);
  var txt = $(".textarea").val();

  if (txt == '') {
    return;
  }
  if (selectedKey) {
    memoRef = database.ref('memos/' + userInfo.uid + '/' + selectedKey);
    memoRef.update({
      txt: txt,
      update_date: getTimeStamp()
    });
  } else {
    //push 로 저장.
    memoRef.push({
      txt: txt,
      createdate: getTimeStamp()
    });
  }
}

//새 메모 작성.
function initMemo() {
  $(".textarea").val('');
  selectedKey = null;
}

//엘리먼트에서 포커스를 잃을때 메모 저장..
$(function () {
  $(".textarea").blur(function () {
    save_data();
  });
});

function getTimeStamp() {
  var d = new Date();
  var s =
    leadingZeros(d.getFullYear(), 4) + '-' +
    leadingZeros(d.getMonth() + 1, 2) + '-' +
    leadingZeros(d.getDate(), 2) + ' ' +

    leadingZeros(d.getHours(), 2) + ':' +
    leadingZeros(d.getMinutes(), 2) + ':' +
    leadingZeros(d.getSeconds(), 2);

  return s;
}

function leadingZeros(n, digits) {
  var zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (i = 0; i < digits - n.length; i++)
      zero += '0';
  }
  return zero + n;
}