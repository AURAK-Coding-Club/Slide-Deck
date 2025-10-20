/* JS only used for computer interactions (power on, input..) */

class Hardware {
  constructor(light) {
    this.light = light;
    this.state = 'off';
  }

  on() {
    this.state = 'on';
    this.light.removeClass("lightOff");
    this.light.addClass("lightOn");
  }

  off() {
    this.state = 'off';
    this.light.removeClass("lightOn");
    this.light.addClass("lightOff");
  }

  isOn() {
    return this.state == 'on';
  }

  power() {
    if (this.isOn()) {
      this.off();
    } else {
      this.on();
    }
  }}




class Screen extends Hardware {
  constructor(output, light) {
    super(light);
    this.output = output;
    this.output.hide();
    this.output.parent().removeClass("screenEffect");
    this.noSignalMode = false;;
  }

  write(text, leftOffset) {
    if (leftOffset) {
      var $span = $(document.createElement("span"));
      $span.append(text + "<br/>");
      $span.css("padding-left", leftOffset + "px");
      this.output.append($span);
    } else {
      this.output.append(text + "<br/>");
    }
    this.scroll();
  }

  scroll() {
    this.output.animate({
      scrollTop: $(".output").height() },
    0);
  }

  newLine() {
    this.output.append("<br/>");
  }

  clear() {
    this.output.empty();
  }

  input(centralUnit) {
    this.output.append("A> ");
    var $input = $(document.createElement("input"));
    $input.addClass("terminalInput");
    this.output.append($input);
    this.output.append("<br/>");
    $input.focus();
    var screen = this;
    $input.on("keypress", function (event) {
      if (event.which == 13) {
        centralUnit.command(screen, $input.val());
        $input.prop("disabled", true);
        screen.input(centralUnit);
      }
    });
  }

  on(callback) {
    super.on();
    var screen = this;
    this.output.parent().addClass("screenEffect");
    this.output.show();
    this.output.delay(1000).queue(function (next) {
      next();
      screen.write("Checking connections...");
      screen.output.delay(2000).queue(function (next) {
        next();
        callback();
      });
    });
  }

  off() {
    super.off();
    var screen = this;
    if (this.noSignalMode) {
      this.signal();
    }
    this.write("Disconnecting...");
    this.output.delay(2000).queue(function (next) {
      next();
      screen.output.hide();
      screen.output.parent().removeClass("screenEffect");
    });
  }

  signal() {
    this.output.find("#noSignal").remove();
  }

  power(centralUnit, callback) {
    if (this.isOn()) {
      this.off();
      callback(true);
    } else {
      var screen = this;
      var connection = false;
      this.on(function () {
        if (!centralUnit.isOn()) {
          screen.noSignal();
          callback(connection);
        } else {
          if (centralUnit.isBoot()) {
            centralUnit.terminal(screen);
          }
          connection = true;
          callback(connection);
        }
      });
    }
  }

  connect(callback) {
    var screen = this;
    this.output.delay(1000).queue(function (next) {
      next();
      if (screen.noSignalMode) {
        screen.noSignalMode = false;
        screen.signal();
      }
      screen.write("EGA connector initialized");
      callback();
    });
  }

  noSignal() {
    this.noSignalMode = true;
    var $popup = $(document.createElement("div"));
    $popup.addClass("popup");
    $popup.addClass("screenEffect");
    $popup.attr("id", "noSignal");
    $popup.text("NO SIGNAL");
    this.output.append($popup);
  }}


class CentralUnit extends Hardware {
  constructor(button, light) {
    super(light);
    this.button = button;
    this.bootStatus = false;
  }

  on(screen, callback) {
    super.on();
    this.button.removeClass("computerButtonOff");
    this.button.addClass("computerButtonOn");
    screen.connect(function () {
      callback();
    });
  }

  off(screen) {
    super.off();
    this.button.removeClass("computerButtonOn");
    this.button.addClass("computerButtonOff");
    this.bootStatus = false;
    screen.clear();
  }

  power(screen) {
    if (this.isOn()) {
      this.off(screen);
      if (screen.isOn()) {
        screen.output.delay(1000).queue(function (next) {
          next();
          screen.noSignal();
        });
      }
    } else {
      var centralUnit = this;
      this.on(screen, function () {
        centralUnit.boot(screen);
      });
    }
  }

  date() {
    var date = new Date();
    var dayNumbers = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
    return dayNumbers[date.getDay()] + " " + (date.getMonth() + 1) + "-" + date.getDate() + "-" + date.getFullYear();
  }

  terminal(screen) {
    screen.newLine();
    screen.input(this);
    screen.scroll();
  }

  command(screen, command) {
    var cmd = command.trim().toLowerCase();
    var args = command.trim().split(' ');
    var cmdName = args[0].toLowerCase();
    
    if (cmd === "") {
      return;
    }
    
    // Command implementations
    if (cmd === "crew") {
      screen.newLine();
      screen.write("Dr. Khouloud Salameh - Supervisor");
      screen.write("Riyad Almasri - President");
      screen.write("Nour Mostafa - Executive");
      screen.write("Mohammed AlShamsi - Ideator");
      screen.write("Hazim Anwar - Social Media Manager");
      screen.write("Zohaa Khan - Graphic Designer");
      screen.write("Muhammad Mustafa - Photographer/Videographer");
    }
    else if (cmd === "club") {
      screen.newLine();
      screen.write("The Coding Club is dedicated to fostering a");
      screen.write("passion for coding and technology among students");
      screen.write("at the American University of Ras Al Khaimah.");
      screen.write("Whether you're a beginner or an experienced coder,");
      screen.write("our club offers a welcoming community where you");
      screen.write("can learn, collaborate, and unleash your creativity");
      screen.write("through coding projects and activities.");
    }
    else if (cmd === "slogan") {
      screen.newLine();
      screen.write("Code. Create. Conquer.");
    }
    else if (cmd === "activities") {
      screen.newLine();
      screen.write("- Tech Talks");
      screen.write("- Dev Discussions");
      screen.write("- Review Rounds");
      screen.write("- Hackathons");
      screen.write("- Collabs");
      screen.write("- Memes");
      screen.write("- Polls");
      screen.write("- Typeathons");
    }
    else if (cmd === "achievements") {
      screen.newLine();
      screen.write("We are Two-Time AURAK's Most Active Student Club Award winner!!!");
    }
    else if (cmd === "titans") {
      screen.newLine();
      screen.write("A semesterly competitive leaderboard set to foster");
      screen.write("student engagement in club activities. Top 3 ranks");
      screen.write("will be awarded Coding Club Tech Titan certificates.");
      screen.write("Our recent Tech Titans are:");
      screen.write("1. Abdulghani Sabbagh");
      screen.write("2. Fares Masarani");
      screen.write("3. Mohamed Sheikurameez");
    }
    else if (cmd === "members") {
      screen.newLine();
      screen.write("We are about to hit 300 members!");
    }
    else if (cmd === "email") {
      screen.newLine();
      screen.write("codingclub2024@aurak.ac.ae");
    }
    else if (cmd === "plans") {
      screen.newLine();
      screen.write("(No plans listed yet)");
    }
    else if (cmd === "perks") {
      screen.newLine();
      screen.write("(No perks listed yet)");
    }
    else if (cmd === "github") {
      screen.newLine();
      var $img = $(document.createElement("img"));
      $img.attr("src", "assets/github.png");
      $img.css({
        "max-width": "200px",
        "max-height": "150px",
        "display": "block",
        "margin": "5px 0"
      });
      screen.output.append($img);
      screen.output.append("<br/>");
    }
    else if (cmd === "youtube") {
      screen.newLine();
      var $img = $(document.createElement("img"));
      $img.attr("src", "assets/youtube.png");
      $img.css({
        "max-width": "200px",
        "max-height": "150px",
        "display": "block",
        "margin": "5px 0"
      });
      screen.output.append($img);
      screen.output.append("<br/>");
    }
    else if (cmd === "discord") {
      screen.newLine();
      var $img = $(document.createElement("img"));
      $img.attr("src", "assets/discord.png");
      $img.css({
        "max-width": "200px",
        "max-height": "150px",
        "display": "block",
        "margin": "5px 0"
      });
      screen.output.append($img);
      screen.output.append("<br/>");
    }
    else if (cmdName === "echo") {
      screen.newLine();
      var echoText = args.slice(1).join(' ');
      if (echoText) {
        screen.write(echoText);
      }
    }
    else if (cmd === "cls" || cmd === "clear") {
      screen.clear();
      return; // Skip the new line after clearing
    }
    else if (cmd === "help") {
      screen.newLine();
      screen.write("Available commands:");
      screen.write("  crew        - Show club crew members");
      screen.write("  club        - About the Coding Club");
      screen.write("  slogan      - Club slogan");
      screen.write("  activities  - Club activities");
      screen.write("  achievements- Club achievements");
      screen.write("  titans      - Tech Titans leaderboard");
      screen.write("  members     - Membership count");
      screen.write("  email       - Contact email");
      screen.write("  plans       - Future plans");
      screen.write("  perks       - Membership perks");
      screen.write("  github      - Show GitHub QR code");
      screen.write("  youtube     - Show YouTube QR code");
      screen.write("  discord     - Show Discord QR code");
      screen.write("  echo [text] - Echo back text");
      screen.write("  cls         - Clear the screen");
      screen.write("  help        - Show this help message");
    }
    else {
      screen.newLine();
      screen.write("Command not recognized. Type 'help' for available commands.");
    }
  }

  isBoot() {
    return this.bootStatus;
  }

  boot(screen) {
    var centralUnit = this;
    screen.output.delay(1000).queue(function (next) {
      next();
      screen.write("Booting up...");
      screen.output.delay(200).queue(function (next) {
        next();
        screen.newLine();
        screen.write("Hard Disk System Configuration:");
        screen.output.delay(200).queue(function (next) {
          next();
          screen.newLine();
          screen.write("A: Hard Disk, 4.8 Mbytes", 20);
          screen.output.delay(200).queue(function (next) {
            next();
            screen.write("B: Hard Disk, Floppy Size", 20);
            screen.output.delay(200).queue(function (next) {
              next();
              screen.write("C: Floppy Disk", 20);
              screen.output.delay(200).queue(function (next) {
                next();
                screen.newLine();
                screen.write("Current date is " + centralUnit.date());
                screen.output.delay(200).queue(function (next) {
                  next();
                  screen.newLine();
                  screen.write("IBM Personnal Computer");
                  screen.output.delay(200).queue(function (next) {
                    next();
                    screen.write("Version 1.23 Copyright IBM Corp 1984");
                    screen.output.delay(200).queue(function (next) {
                      next();
                      centralUnit.terminal(screen);
                      centralUnit.bootStatus = true;
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  }}


class Computer {
  constructor(centralUnit, screen) {
    this.centralUnit = centralUnit;
    this.screen = screen;
    this.connection = false;
  }

  startScreen() {
    var computer = this;
    this.screen.power(this.centralUnit, function (connection) {
      computer.connection = connection;
    });
  }

  startCentralUnit() {
    this.centralUnit.power(this.screen);
  }}


var screen = new Screen($(".output"), $(".screenBox").find(".powerLight"));
var centralUnit = new CentralUnit($(".computerButton"), $(".computer").find(".powerLight"));
var computer = new Computer(centralUnit, screen);

$(".screenBox").find(".powerButton").on("click", function () {
  computer.startScreen();
});

$(".computerButton").on("click", function () {
  computer.startCentralUnit();
});

computer.startScreen();
computer.centralUnit.button.delay(2000).queue(function (next) {
  computer.startCentralUnit();
});