width = 60;
depth = 40;
height = 24;
wall = 2;

difference() {
  cube([width, depth, height]);
  translate([wall, wall, wall])
    cube([width - wall * 2, depth - wall * 2, height]);
}
