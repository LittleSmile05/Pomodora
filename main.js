<!-- jQuery CDN -->
<script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>

<script>
  $(document).ready(function () {
    const timer = {
      pomodoro: 25,
      shortBreak: 5,
      longBreak: 15,
      longBreakInterval: 4,
      sessions: 0,
      remainingTime: {},
    };

    let interval;

    const buttonSound = new Audio('button-sound.mp3');
    const mainButton = $('#js-btn');
    mainButton.on('click', function () {
      buttonSound.play();
      const action = mainButton.data('action');
      if (action === 'start') {
        startTimer();
      } else {
        stopTimer();
      }
    });

    const modeButtons = $('#js-mode-buttons');
    modeButtons.on('click', handleMode);

    function getRemainingTime(endTime) {
      const currentTime = Date.parse(new Date());
      const difference = endTime - currentTime;

      const total = Number.parseInt(difference / 1000, 10);
      const minutes = Number.parseInt((total / 60) % 60, 10);
      const seconds = Number.parseInt(total % 60, 10);

      return {
        total,
        minutes,
        seconds,
      };
    }

    function startTimer() {
      let { total } = timer.remainingTime;
      const endTime = Date.parse(new Date()) + total * 1000;

      if (timer.mode === 'pomodoro') timer.sessions++;

      mainButton.data('action', 'stop');
      mainButton.text('stop');
      mainButton.addClass('active');

      interval = setInterval(function () {
        timer.remainingTime = getRemainingTime(endTime);
        updateClock();

        total = timer.remainingTime.total;
        if (total <= 0) {
          clearInterval(interval);

          switch (timer.mode) {
            case 'pomodoro':
              if (timer.sessions % timer.longBreakInterval === 0) {
                switchMode('longBreak');
              } else {
                switchMode('shortBreak');
              }
              break;
            default:
              switchMode('pomodoro');
          }

          if (Notification.permission === 'granted') {
            const text =
              timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
            new Notification(text);
          }

          $(`[data-sound="${timer.mode}"]`).get(0).play();

          startTimer();
        }
      }, 1000);
    }

    function stopTimer() {
      clearInterval(interval);

      mainButton.data('action', 'start');
      mainButton.text('start');
      mainButton.removeClass('active');
    }

    function updateClock() {
      const { remainingTime } = timer;
      const minutes = `${remainingTime.minutes}`.padStart(2, '0');
      const seconds = `${remainingTime.seconds}`.padStart(2, '0');

      const min = $('#js-minutes');
      const sec = $('#js-seconds');
      min.text(minutes);
      sec.text(seconds);

      const text =
        timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
      document.title = `${minutes}:${seconds} — ${text}`;

      const progress = $('#js-progress');
      progress.val(timer[timer.mode] * 60 - timer.remainingTime.total);
    }

    function switchMode(mode) {
      timer.mode = mode;
      timer.remainingTime = {
        total: timer[mode] * 60,
        minutes: timer[mode],
        seconds: 0,
      };

      $('button[data-mode]').removeClass('active');
      $(`[data-mode="${mode}"]`).addClass('active');
      $('body').css('background-color', `var(--${mode})`);
      $('#js-progress').attr('max', timer.remainingTime.total);

      updateClock();
    }

    function handleMode(event) {
      const mode = $(event.target).data('mode');

      if (!mode) return;

      switchMode(mode);
      stopTimer();
    }

    $(document).ready(function () {
      if ('Notification' in window) {
        if (
          Notification.permission !== 'granted' &&
          Notification.permission !== 'denied'
        ) {
          Notification.requestPermission().then(function (permission) {
            if (permission === 'granted') {
              new Notification(
                'Awesome! You will be notified at the start of each session'
              );
            }
          });
        }
      }

      switchMode('pomodoro');
    });
  });
</script>
